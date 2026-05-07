import express from 'express';
import * as path from 'path';
import { getEconomyTier, pusher } from '../lib/stratlog';
import { analyzeGameState, shouldAnalyze } from '../lib/ai-analyze';
import { getHistory } from '../lib/round-history';
import { getMapKnowledge } from '../lib/maps';
import { saveState, getState } from '../lib/state-store';

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

// POST /api/gsi — 接收 CS2 GSI 数据
app.post('/api/gsi', async (req, res) => {
    try {
        const { sessionId, gsiData } = req.body;
        if (!sessionId || !gsiData) {
            return res.status(400).json({ error: 'Missing data' });
        }

        const map = gsiData.map?.name || 'de_mirage';
        const round = gsiData.map?.round || 0;
        const phase = gsiData.phase_countdowns?.phase || gsiData.map?.phase || 'live';
        const player = gsiData.player as GSIPlayer | undefined;
        const playerName = player?.name || 'Player';
        const team = player?.team || 'T';
        const health = player?.state?.health ?? 0;
        const money = parseMoney(player?.state?.money);
        const ecoTier = getEconomyTier(money);

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
            ct: gsiData.map?.team_ct?.score ?? 0,
            t: gsiData.map?.team_t?.score ?? 0,
        };

        const history = getHistory(sessionId);
        const bombPlanted = gsiData.round?.bomb === 'planted';

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

        // Pusher 云端同步（手机可远程接收）
        if (pusher) {
            try {
                await pusher.trigger(`session-${sessionId}`, 'state-update', state);
            } catch (err) {
                console.error('[Pusher] Error:', err);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('GSI Error:', error);
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

// 生产环境：服务 Next.js 静态导出文件
function serveStatic(outDir: string) {
    // 静态资源 (_next 目录)
    app.use(express.static(outDir));

    // 页面路由：/dashboard → out/dashboard.html
    const pages = ['dashboard', 'tactics', 'leaderboard', 'changelog', 'connect'];
    for (const page of pages) {
        app.get(`/${page}`, (_req, res) => {
            res.sendFile(path.join(outDir, `${page}.html`));
        });
    }

    // 根路由
    app.get('/', (_req, res) => {
        res.sendFile(path.join(outDir, 'index.html'));
    });

    // 其他路由 fallback
    app.get('/{*path}', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(outDir, '404.html'));
        }
    });
}

function startServer(port: number = 0, publicAccess: boolean = false): Promise<{ port: number; close: () => void }> {
    const host = publicAccess ? '0.0.0.0' : '127.0.0.1';
    return new Promise((resolve) => {
        const server = app.listen(port, host, () => {
            const addr = server.address();
            const actualPort = typeof addr === 'object' && addr ? addr.port : port;
            console.log(`[Server] API running on http://${host}:${actualPort}`);
            resolve({
                port: actualPort,
                close: () => server.close(),
            });
        });
    });
}

export { app, startServer, serveStatic };
