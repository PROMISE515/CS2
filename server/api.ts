import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { getEconomyTier, pusher } from '../lib/stratlog';
import { analyzeGameState, shouldAnalyze } from '../lib/ai-analyze';
import { getHistory } from '../lib/round-history';
import { getMapKnowledge } from '../lib/maps';
import { saveState, getState, saveHeartbeat, getConnectionState } from '../lib/state-store';

interface GSIPlayer {
    name?: string;
    team?: 'CT' | 'T';
    state?: { health?: number; money?: number; round_kills?: number; round_killhs?: number };
    weapons?: Record<string, { name?: string; type?: string; state?: string }>;
    match_stats?: { kills?: number; deaths?: number; assists?: number };
    position?: string;
}

function parseMoney(val: unknown): number {
    return typeof val === 'number' ? val : 0;
}

const app = express();
app.use(express.json());

// CORS — 允许 Electron 窗口访问
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

// GSI 请求追踪
const gsiRequestLog = new Map<string, number>();
const gsiRequestCounts = new Map<string, number>();

// POST /api/gsi — 接收 CS2 GSI 数据（兼容原生格式和包装格式）
app.post('/api/gsi', async (req, res) => {
    try {
        let sessionId: string;
        let gsiData: Record<string, unknown>;

        // 格式检测：CS2 原生格式 vs 包装格式
        if (req.body.auth?.sessionId) {
            // CS2 原生格式：auth 嵌在 body 中，整个 body 就是 gsiData
            sessionId = req.body.auth.sessionId;
            gsiData = req.body;
            console.log(`[GSI] 收到原生格式请求, session: ${sessionId}`);
        } else if (req.body.sessionId && req.body.gsiData) {
            // 包装格式：测试脚本使用
            sessionId = req.body.sessionId;
            gsiData = req.body.gsiData;
            console.log(`[GSI] 收到包装格式请求, session: ${sessionId}`);
        } else if (req.body.provider || req.body.map || req.body.player) {
            // CS2 原生格式但 auth 字段缺失或格式异常 → 使用默认 session
            sessionId = 'default';
            gsiData = req.body;
            console.log(`[GSI] 收到原生格式请求(无auth), session: default`);
        } else {
            console.warn('[GSI] 收到无法识别的请求格式:', JSON.stringify(Object.keys(req.body)));
            return res.status(400).json({ error: 'Unrecognized GSI payload format' });
        }

        // 追踪 GSI 请求
        const count = (gsiRequestCounts.get(sessionId) ?? 0) + 1;
        gsiRequestLog.set(sessionId, Date.now());
        gsiRequestCounts.set(sessionId, count);

        // 心跳检测：只有 provider 没有 map 数据 → CS2 已连接但未在游戏中
        const isHeartbeat = gsiData.provider && !gsiData.map;
        if (isHeartbeat) {
            console.log(`[GSI] 心跳 #${count}, session: ${sessionId}`);
            saveHeartbeat(sessionId);
            if (pusher) {
                try {
                    await pusher.trigger(`session-${sessionId}`, 'connection-update', {
                        state: 'connected',
                        timestamp: Date.now(),
                    });
                } catch (err) {
                    console.error('[Pusher] 心跳推送失败:', err);
                }
            }
            return res.json({ success: true, type: 'heartbeat' });
        }

        // 无 map 数据也无 provider → 无效请求
        if (!gsiData.map && !gsiData.player) {
            console.log(`[GSI] 忽略无效请求 #${count}, session: ${sessionId}`);
            return res.json({ success: true, type: 'ignored' });
        }

        const map = (gsiData.map as Record<string, unknown>)?.name as string || 'de_mirage';
        const round = ((gsiData.map as Record<string, unknown>)?.round as number) || 0;
        const phase = (gsiData.phase_countdowns as Record<string, unknown>)?.phase as string
            || (gsiData.map as Record<string, unknown>)?.phase as string || 'live';
        const player = gsiData.player as GSIPlayer | undefined;
        const playerName = player?.name || 'Player';
        const team = player?.team || 'T';
        const health = player?.state?.health ?? 0;
        const money = parseMoney(player?.state?.money);
        const ecoTier = getEconomyTier(money);

        console.log(`[GSI] 游戏数据 #${count}: ${map} R${round} ${phase} | ${playerName} ${team} ${health}HP $${money} ${ecoTier}`);

        // 统计存活人数
        let ctAlive = 0, tAlive = 0;
        if (gsiData.allplayers) {
            for (const p of Object.values(gsiData.allplayers) as GSIPlayer[]) {
                if ((p.state?.health ?? 0) > 0) {
                    if (p.team === 'CT') ctAlive++;
                    else tAlive++;
                }
            }
        } else {
            if (health > 0) {
                if (team === 'CT') ctAlive = 1;
                else tAlive = 1;
            }
        }

        const score = {
            ct: ((gsiData.map as Record<string, unknown>)?.team_ct as Record<string, unknown>)?.score as number ?? 0,
            t: ((gsiData.map as Record<string, unknown>)?.team_t as Record<string, unknown>)?.score as number ?? 0,
        };

        const history = getHistory(sessionId);
        const bombPlanted = (gsiData.round as Record<string, unknown>)?.bomb === 'planted';

        // 回合结束 → 记录历史 + 触发 AI
        let aiAdvice = null;
        if (shouldAnalyze(phase, round) && round > 1) {
            const winner: 'CT' | 'T' = ctAlive > tAlive ? 'CT' : 'T';
            history.endRound({
                round: round - 1,
                winner,
                endReason: bombPlanted ? 'bomb_exploded' : 'elimination',
                score,
                playerEconomy: money,
                playerAlive: health > 0,
                playerKills: player?.match_stats?.kills ?? 0,
                playerDeathRound: health <= 0,
                bombPlanted,
            });

            console.log(`[AI] 触发 AI 分析: ${map} R${round} ${phase} | CT ${score.ct}:${score.t} T`);
            aiAdvice = await analyzeGameState({
                map,
                round,
                phase,
                team,
                economy: ecoTier,
                playerName,
                playerAlive: health > 0,
                playerHealth: health,
                playerMoney: money,
                playerKills: player?.match_stats?.kills ?? 0,
                playerDeaths: player?.match_stats?.deaths ?? 0,
                aliveCount: { ct: ctAlive, t: tAlive },
                bombPlanted,
                score,
                roundHistory: history.getSummary(playerName),
                mapKnowledge: getMapKnowledge(map),
            });

            if (aiAdvice) {
                console.log(`[AI] ✓ 分析完成: ${aiAdvice.situation} | ${aiAdvice.command} | 紧迫度: ${aiAdvice.urgency}`);
            } else {
                console.log('[AI] 分析返回 null (可能未配置 MIMO_API_KEY)');
            }
        }

        const state = {
            map,
            round,
            phase,
            team,
            economy: ecoTier,
            playerName,
            health,
            money,
            aliveCount: { ct: ctAlive, t: tAlive },
            score,
            bombPlanted,
            aiAdvice,
            kills: player?.match_stats?.kills ?? 0,
            deaths: player?.match_stats?.deaths ?? 0,
        };

        saveState(sessionId, state);
        console.log(`[GSI] ✓ 状态已保存, session: ${sessionId}, 数据: ${JSON.stringify({map, round, phase, team, economy: ecoTier})}`);

        // Pusher 云端同步（手机可远程接收）
        if (pusher) {
            try {
                await pusher.trigger(`session-${sessionId}`, 'state-update', state);
                await pusher.trigger(`session-${sessionId}`, 'connection-update', {
                    state: 'in_game',
                    timestamp: Date.now(),
                });
                console.log(`[Pusher] ✓ 事件已推送, channel: session-${sessionId}`);
            } catch (err) {
                console.error('[Pusher] ✗ 推送失败:', err);
            }
        } else {
            console.log('[Pusher] 未配置，跳过推送');
        }

        res.json({ success: true, type: 'game_data' });
    } catch (error) {
        console.error('[GSI] ✗ 处理请求时出错:', error);
        console.error('[GSI]   请求体:', JSON.stringify(req.body).substring(0, 500));
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/state — 返回当前状态
app.get('/api/state', (req, res) => {
    const sessionId = req.query.s as string;
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing session ID' });
    }
    const state = getState(sessionId);
    res.json({ state: state || null });
});

// GET /api/connection — 返回连接状态
app.get('/api/connection', (req, res) => {
    const sessionId = req.query.s as string;
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing session ID' });
    }
    const conn = getConnectionState(sessionId);
    res.json(conn);
});

// GET /api/gsi/health — GSI 连接健康检查
app.get('/api/gsi/health', (req, res) => {
    const sessionId = req.query.s as string;
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing session ID' });
    }
    const conn = getConnectionState(sessionId);
    const lastGsi = gsiRequestLog.get(sessionId) ?? null;
    const gsiCount = gsiRequestCounts.get(sessionId) ?? 0;

    console.log(`[Health] session: ${sessionId}, state: ${conn.state}, gsi_count: ${gsiCount}, last_gsi: ${lastGsi ? new Date(lastGsi).toISOString() : 'never'}`);

    res.json({
        serverRunning: true,
        session: sessionId,
        connection: conn,
        lastGsiReceived: lastGsi,
        gsiReceivedCount: gsiCount,
    });
});

// 生产环境：服务 Next.js 静态导出文件
function serveStatic(outDir: string) {
    // 页面路由：/dashboard → out/dashboard.html（先注册，避免被 static 拦截）
    const pages = ['dashboard', 'tactics', 'leaderboard', 'changelog', 'connect'];
    for (const page of pages) {
        app.get(`/${page}`, (_req, res) => {
            res.type('html').send(fs.readFileSync(path.join(outDir, `${page}.html`), 'utf-8'));
        });
    }

    // 根路由
    app.get('/', (_req, res) => {
        res.type('html').send(fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8'));
    });

    // 静态资源 (_next 目录、CSS、JS 等)
    app.use(express.static(outDir));

    // 其他路由 fallback
    app.get('/{*path}', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.type('html').send(fs.readFileSync(path.join(outDir, '404.html'), 'utf-8'));
        }
    });
}

function startServer(port: number = 0, publicAccess: boolean = false): Promise<{ port: number; close: () => void }> {
    const host = publicAccess ? '0.0.0.0' : '127.0.0.1';
    return new Promise((resolve, reject) => {
        const server = app.listen(port, host, () => {
            const addr = server.address();
            const actualPort = typeof addr === 'object' && addr ? addr.port : port;
            console.log(`[Server] API running on http://${host}:${actualPort}`);
            resolve({
                port: actualPort,
                close: () => server.close(),
            });
        });
        server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                reject(new Error(`Port ${port} is already in use`));
            } else {
                reject(err);
            }
        });
    });
}

export { app, startServer, serveStatic };
