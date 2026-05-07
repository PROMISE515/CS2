// AI 战术教练 — 使用小米 MiMo 模型
// 回合结束后分析局势，给出下回合战术建议

const MIMO_API_KEY = process.env.MIMO_API_KEY;
const MIMO_API_URL = process.env.MIMO_API_URL || 'https://token-plan-sgp.xiaomimimo.com/anthropic/v1/messages';
const MODEL_NAME = process.env.MIMO_MODEL || 'mimo-v2.5';

export interface GameState {
    map: string;
    round: number;
    phase: string;
    team: string;
    economy: string;
    playerName: string;
    playerAlive: boolean;
    playerHealth: number;
    playerMoney: number;
    playerKills: number;
    playerDeaths: number;
    aliveCount: { ct: number; t: number };
    bombPlanted: boolean;
    bombSite?: string;
    score: { ct: number; t: number };
    roundHistory: string;   // 压缩的回合历史
    mapKnowledge: string;   // 地图知识
}

export interface TacticalAdvice {
    situation: string;
    command: string;
    urgency: 'high' | 'medium' | 'low';
    buyAdvice?: string;
}

const SYSTEM_PROMPT = `你是CS2专业战术教练。每回合结束后给队伍简短的战术建议。

规则：
- 用中文，像真实比赛教练喊话
- 简洁有力，每条不超30字
- 根据地图知识和历史规律给出具体战术
- 严格按格式输出：

局势: [当前局势判断]
指挥: [下回合具体战术]
买枪: [经济建议]
紧迫度: [高/中/低]`;

export function buildPrompt(state: GameState): string {
    return `${state.mapKnowledge}

当前比赛:
${state.score.ct}:${state.score.t} | 第${state.round}回合 | ${state.team}方 | 经济:${state.economy}
你: ${state.playerAlive ? '存活' : '阵亡'} ${state.playerHealth}HP $${state.playerMoney} | K${state.playerKills}/D${state.playerDeaths}
存活: CT${state.aliveCount.ct} T${state.aliveCount.t}
${state.bombPlanted ? '炸弹已放置 ' + (state.bombSite || '') + '点' : ''}

最近回合:
${state.roundHistory || '第1局，暂无历史'}

给出下回合战术。`;
}

export async function analyzeGameState(state: GameState): Promise<TacticalAdvice | null> {
    if (!MIMO_API_KEY) return null;

    try {
        const response = await fetch(MIMO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': MIMO_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                max_tokens: 512,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: buildPrompt(state) }],
            }),
        });

        if (!response.ok) {
            console.error('MiMo API error:', response.status);
            return null;
        }

        const data = await response.json() as { content?: Array<{ type: string; text?: string }> };
        const textBlock = (data.content || []).find((c) => c.type === 'text');
        const text: string = textBlock?.text || '';
        if (!text) return null;

        const situation = text.match(/局势[:：]\s*(.+)/)?.[1]?.trim() || '';
        const command = text.match(/指挥[:：]\s*(.+)/)?.[1]?.trim() || '';
        const buy = text.match(/买枪[:：]\s*(.+)/)?.[1]?.trim() || '';
        const urgencyText = text.match(/紧迫度[:：]\s*(.+)/)?.[1]?.trim() || '';

        let urgency: 'high' | 'medium' | 'low' = 'medium';
        if (urgencyText.includes('高')) urgency = 'high';
        else if (urgencyText.includes('低')) urgency = 'low';

        return {
            situation: situation || text.substring(0, 60),
            command: command || text.substring(0, 60),
            urgency,
            buyAdvice: buy || undefined,
        };
    } catch (err) {
        console.error('AI Error:', err);
        return null;
    }
}

// 仅在回合结束时触发（freezetime 开始 = 上一回合刚结束）
let lastAnalyzedRound = -1;

export function shouldAnalyze(phase: string, round: number): boolean {
    if (phase === 'freezetime' && round !== lastAnalyzedRound) {
        lastAnalyzedRound = round;
        return true;
    }
    return false;
}
