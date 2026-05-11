export type ConnectionState = 'disconnected' | 'connected' | 'in_game';

interface SessionEntry {
    data: unknown;
    connectionState: ConnectionState;
    lastHeartbeat: number;
    lastGameData: number;
    timestamp: number;
}

// 60 秒无心跳 → 判定断线
const HEARTBEAT_TIMEOUT = 60_000;
// 5 分钟数据过期
const DATA_EXPIRY = 5 * 60 * 1000;

const stateStore = new Map<string, SessionEntry>();

export function saveState(sessionId: string, data: unknown) {
    const now = Date.now();
    const existing = stateStore.get(sessionId);
    stateStore.set(sessionId, {
        data,
        connectionState: 'in_game',
        lastHeartbeat: existing?.lastHeartbeat ?? now,
        lastGameData: now,
        timestamp: now,
    });
}

export function saveHeartbeat(sessionId: string) {
    const now = Date.now();
    const existing = stateStore.get(sessionId);
    stateStore.set(sessionId, {
        data: existing?.data ?? null,
        connectionState: existing?.connectionState === 'in_game' ? 'in_game' : 'connected',
        lastHeartbeat: now,
        lastGameData: existing?.lastGameData ?? 0,
        timestamp: now,
    });
}

export function getState(sessionId: string): unknown | null {
    const entry = stateStore.get(sessionId);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > DATA_EXPIRY) {
        stateStore.delete(sessionId);
        return null;
    }
    return entry.data;
}

export function getConnectionState(sessionId: string): { state: ConnectionState; lastSeen: number } {
    const entry = stateStore.get(sessionId);
    if (!entry) return { state: 'disconnected', lastSeen: 0 };

    const now = Date.now();
    const lastSeen = Math.max(entry.lastHeartbeat, entry.lastGameData);

    // 超时判定断线
    if (now - lastSeen > HEARTBEAT_TIMEOUT) {
        entry.connectionState = 'disconnected';
        return { state: 'disconnected', lastSeen };
    }

    // 如果有最近的游戏数据 → in_game
    if (entry.data && now - entry.lastGameData < HEARTBEAT_TIMEOUT) {
        return { state: 'in_game', lastSeen: entry.lastGameData };
    }

    return { state: entry.connectionState, lastSeen };
}
