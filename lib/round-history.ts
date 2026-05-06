// 回合历史记录器 — 记录每回合的关键事件，供 AI 分析

export interface KillEvent {
    time: number;       // 回合内时间（秒）
    killer: string;
    victim: string;
    weapon: string;
    headshot: boolean;
}

export interface RoundRecord {
    round: number;
    winner: 'CT' | 'T';
    endReason: 'elimination' | 'bomb_exploded' | 'bomb_defused' | 'time';
    score: { ct: number; t: number };
    kills: KillEvent[];
    playerEconomy: number;      // 该玩家回合结束时的金钱
    playerAlive: boolean;       // 该玩家是否存活
    playerKills: number;        // 该玩家本回合击杀数
    playerDeathRound: boolean;  // 该玩家是否阵亡
    bombPlanted: boolean;
    bombSite?: 'A' | 'B';
}

const MAX_HISTORY = 12; // 保留最近12回合

export class RoundHistory {
    private rounds: RoundRecord[] = [];
    private currentKills: KillEvent[] = [];
    private roundStartTime = 0;

    addKill(kill: KillEvent) {
        this.currentKills.push(kill);
    }

    endRound(record: Omit<RoundRecord, 'kills'>) {
        const full: RoundRecord = { ...record, kills: [...this.currentKills] };
        this.rounds.push(full);
        if (this.rounds.length > MAX_HISTORY) {
            this.rounds.shift();
        }
        this.currentKills = [];
    }

    getRecent(count: number = 6): RoundRecord[] {
        return this.rounds.slice(-count);
    }

    getSummary(playerName: string): string {
        const recent = this.getRecent(6);
        if (recent.length === 0) return '暂无历史数据';

        return recent.map((r, i) => {
            const kills = r.kills.map(k => `${k.killer}[${k.weapon}]${k.victim}`).join(', ');
            const playerResult = r.playerDeathRound ? '阵亡' : `存活(击杀${r.playerKills})`;
            const bomb = r.bombPlanted ? ` C4→${r.bombSite}` : '';
            return `R${r.round}: ${r.winner}赢(${r.endReason}) ${r.score.ct}:${r.score.t} | 你:${playerResult}${bomb} | 击杀:[${kills || '无'}]`;
        }).join('\n');
    }

    getScore(): { ct: number; t: number } {
        if (this.rounds.length === 0) return { ct: 0, t: 0 };
        return this.rounds[this.rounds.length - 1].score;
    }

    getPlayerStats(playerName: string): { totalKills: number; totalDeaths: number; avgEconomy: number } {
        const recent = this.getRecent(12);
        const totalKills = recent.reduce((sum, r) => sum + r.playerKills, 0);
        const totalDeaths = recent.filter(r => r.playerDeathRound).length;
        const avgEconomy = recent.length > 0
            ? recent.reduce((sum, r) => sum + r.playerEconomy, 0) / recent.length
            : 0;
        return { totalKills, totalDeaths, avgEconomy };
    }
}

// 每个 session 一个实例
const sessions = new Map<string, RoundHistory>();

export function getHistory(sessionId: string): RoundHistory {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, new RoundHistory());
    }
    return sessions.get(sessionId)!;
}
