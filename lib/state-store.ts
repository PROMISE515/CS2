// 共享状态存储（仅用于本地开发，生产环境用 Pusher）
const stateStore = new Map<string, { data: unknown; timestamp: number }>();

export function saveState(sessionId: string, data: unknown) {
    stateStore.set(sessionId, { data, timestamp: Date.now() });
}

export function getState(sessionId: string): unknown | null {
    const entry = stateStore.get(sessionId);
    if (!entry) return null;
    // 5 分钟过期（开发调试用）
    if (Date.now() - entry.timestamp > 5 * 60 * 1000) {
        stateStore.delete(sessionId);
        return null;
    }
    return entry.data;
}
