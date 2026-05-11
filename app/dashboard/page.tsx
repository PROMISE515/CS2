'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type ConnectionState = 'disconnected' | 'connected' | 'in_game';

interface GameState {
    map: string;
    round: number;
    phase: string;
    team: string;
    economy: string;
    playerName: string;
    health: number;
    money: number;
    aliveCount: { ct: number; t: number };
    score: { ct: number; t: number };
    bombPlanted: boolean;
    kills: number;
    deaths: number;
    aiAdvice: {
        situation: string;
        command: string;
        urgency: 'high' | 'medium' | 'low';
        buyAdvice?: string;
    } | null;
}

// 断线超时：60 秒无数据 → 回到 disconnected
const DISCONNECT_TIMEOUT = 60_000;

function DashboardContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('s') || '';
    const [state, setState] = useState<GameState | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const lastDataTime = useRef<number>(0);

    // 断线检测定时器
    useEffect(() => {
        const timer = setInterval(() => {
            if (lastDataTime.current > 0 && Date.now() - lastDataTime.current > DISCONNECT_TIMEOUT) {
                setConnectionState('disconnected');
                setState(null);
                lastDataTime.current = 0;
            }
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        const markConnected = () => {
            lastDataTime.current = Date.now();
        };

        const markInGame = (data: GameState) => {
            setState(data);
            setConnectionState('in_game');
            lastDataTime.current = Date.now();
        };

        // Pusher 可用时用实时推送
        if (process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            import('pusher-js').then(({ default: Pusher }) => {
                const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
                    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
                });
                const channel = pusher.subscribe(`session-${sessionId}`);

                // 游戏数据更新
                channel.bind('state-update', (data: GameState) => {
                    markInGame(data);
                });

                // 连接状态更新（心跳）
                channel.bind('connection-update', (data: { state: ConnectionState }) => {
                    if (data.state === 'connected') {
                        setConnectionState('connected');
                        markConnected();
                    }
                });
            });
            return;
        }

        // 轮询模式（Pusher 不可用时的降级方案）
        const pollInterval = setInterval(async () => {
            try {
                // 先查连接状态
                const connRes = await fetch(`/api/connection?s=${sessionId}`);
                const connData = await connRes.json();

                if (connData.state === 'disconnected') {
                    setConnectionState('disconnected');
                    return;
                }

                if (connData.state === 'connected') {
                    setConnectionState('connected');
                    markConnected();
                }

                if (connData.state === 'in_game') {
                    // 有游戏数据，获取最新状态
                    const stateRes = await fetch(`/api/state?s=${sessionId}`);
                    const stateData = await stateRes.json();
                    if (stateData.state) {
                        markInGame(stateData.state);
                    } else {
                        setConnectionState('connected');
                        markConnected();
                    }
                }
            } catch {}
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [sessionId]);

    // === 状态 A：断线 / 等待连接 ===
    if (connectionState === 'disconnected') {
        return (
            <div className="hud-dashboard-layout min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="relative mx-auto mb-8 w-16 h-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/10 border-t-cs-orange"></div>
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-cs-orange/50 text-2xl">radar</span>
                    </div>
                    <p className="text-cs-orange text-sm tracking-[0.2em] uppercase mb-3">等待 CS2 连接</p>
                    <p className="text-white/30 text-xs leading-relaxed mb-6">
                        请确保 CS2 已启动，并且 GSI 配置文件已正确安装。
                        进入游戏对局后，战术数据将自动显示。
                    </p>
                    <div className="glass-panel rounded-lg p-4 text-left space-y-2">
                        <p className="text-white/20 text-[10px] tracking-widest uppercase mb-2">检查清单</p>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                            <span className="material-symbols-outlined text-sm text-white/20">check_circle</span>
                            CS2 已启动并运行
                        </div>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                            <span className="material-symbols-outlined text-sm text-white/20">check_circle</span>
                            GSI 配置文件已放入 cfg 目录
                        </div>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                            <span className="material-symbols-outlined text-sm text-white/20">check_circle</span>
                            已进入游戏对局（匹配/竞技）
                        </div>
                    </div>
                    <p className="text-white/15 text-[10px] font-mono mt-6">Session: {sessionId}</p>
                </div>
            </div>
        );
    }

    // === 状态 B：CS2 已连接，等待进入游戏 ===
    if (connectionState === 'connected') {
        return (
            <div className="hud-dashboard-layout min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="relative mx-auto mb-8 w-16 h-16 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-400 text-5xl">sports_esports</span>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                    </div>
                    <p className="text-green-400 text-sm tracking-[0.2em] uppercase mb-3">CS2 已连接</p>
                    <p className="text-white/40 text-xs leading-relaxed mb-6">
                        正在等待进入游戏对局...
                    </p>
                    <p className="text-white/50 text-sm">进入游戏后将自动显示战术数据</p>
                    <p className="text-white/15 text-[10px] font-mono mt-6">Session: {sessionId}</p>
                </div>
            </div>
        );
    }

    // === 状态 C：游戏中 ===
    if (!state) {
        return (
            <div className="hud-dashboard-layout min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cs-orange"></div>
            </div>
        );
    }

    const isFreezetime = state.phase === 'freezetime';
    const urgencyColor = state.aiAdvice?.urgency === 'high' ? 'text-red-400' :
        state.aiAdvice?.urgency === 'low' ? 'text-green-400' : 'text-yellow-400';
    const urgencyBorder = state.aiAdvice?.urgency === 'high' ? 'border-red-500/40' :
        state.aiAdvice?.urgency === 'low' ? 'border-green-500/40' : 'border-yellow-500/40';

    return (
        <div className="hud-dashboard-layout min-h-screen p-4 md:p-6 flex flex-col gap-4">
            {/* 顶部状态栏 */}
            <header className="glass-panel rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-cs-orange text-2xl">radar</span>
                    <div>
                        <h1 className="text-white text-lg font-bold tracking-tight">CS2 AI 教练</h1>
                        <p className="text-white/40 text-[10px] font-mono">{state.map.toUpperCase()} | 第{state.round}回合</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] text-white/40 tracking-widest uppercase">比分</p>
                        <p className="text-white text-xl font-bold font-mono">{state.score.ct} : {state.score.t}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-white/40 tracking-widest uppercase">经济</p>
                        <p className={`text-sm font-bold font-mono ${state.economy === 'FULL_BUY' ? 'text-green-400' : state.economy === 'ECO' ? 'text-red-400' : 'text-yellow-400'}`}>{state.economy}</p>
                    </div>
                    <div className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${isFreezetime ? 'border-cs-orange text-cs-orange bg-cs-orange/10' : 'border-white/20 text-white/50'}`}>
                        {isFreezetime ? '买枪期' : '对枪中'}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-4">
                {/* 左侧: 玩家信息 */}
                <div className="md:w-1/4 flex flex-col gap-4">
                    {/* 你的状态 */}
                    <div className="glass-panel rounded-xl p-5">
                        <p className="text-[10px] text-cs-orange tracking-widest uppercase mb-3">你的状态</p>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-white/50 text-sm">玩家</span>
                                <span className="text-white font-mono text-sm">{state.playerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50 text-sm">血量</span>
                                <span className={`font-mono text-sm ${state.health > 50 ? 'text-green-400' : state.health > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{state.health} HP</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50 text-sm">金钱</span>
                                <span className="text-yellow-400 font-mono text-sm">${state.money}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50 text-sm">K / D</span>
                                <span className="text-white font-mono text-sm">{state.kills} / {state.deaths}</span>
                            </div>
                        </div>
                    </div>

                    {/* 存活人数 */}
                    <div className="glass-panel rounded-xl p-5">
                        <p className="text-[10px] text-cs-orange tracking-widest uppercase mb-3">存活人数</p>
                        <div className="flex items-center justify-around">
                            <div className="text-center">
                                <p className="text-blue-400 text-3xl font-bold font-mono">{state.aliveCount.ct}</p>
                                <p className="text-[10px] text-blue-400/60 tracking-widest">CT</p>
                            </div>
                            <div className="text-white/20 text-2xl">vs</div>
                            <div className="text-center">
                                <p className="text-yellow-400 text-3xl font-bold font-mono">{state.aliveCount.t}</p>
                                <p className="text-[10px] text-yellow-400/60 tracking-widest">T</p>
                            </div>
                        </div>
                    </div>

                    {/* 炸弹状态 */}
                    {state.bombPlanted && (
                        <div className="glass-panel rounded-xl p-4 border border-red-500/30 bg-red-500/5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-400">warning</span>
                                <p className="text-red-400 text-sm font-bold tracking-widest uppercase">炸弹已放置</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 右侧: AI 战术建议 */}
                <div className="flex-1 flex flex-col gap-4">
                    {state.aiAdvice ? (
                        <>
                            {/* AI 指挥核心 */}
                            <div className={`glass-panel rounded-xl p-6 border-2 ${urgencyBorder} relative overflow-hidden`}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cs-orange via-cs-orange/50 to-transparent"></div>

                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-cs-orange text-2xl">psychology</span>
                                        <h2 className="text-white text-xl font-bold tracking-tight">AI 战术指挥</h2>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full border font-bold tracking-widest uppercase ${urgencyColor} ${urgencyBorder}`}>
                                        {state.aiAdvice.urgency === 'high' ? '紧迫' : state.aiAdvice.urgency === 'low' ? '常规' : '关注'}
                                    </span>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[10px] text-cs-orange tracking-widest uppercase mb-1">局势判断</p>
                                        <p className="text-white text-lg">{state.aiAdvice.situation}</p>
                                    </div>
                                    <div className="h-px bg-white/10"></div>
                                    <div>
                                        <p className="text-[10px] text-cs-orange tracking-widest uppercase mb-1">战术指挥</p>
                                        <p className="text-white text-xl font-bold">{state.aiAdvice.command}</p>
                                    </div>
                                    {state.aiAdvice.buyAdvice && (
                                        <>
                                            <div className="h-px bg-white/10"></div>
                                            <div>
                                                <p className="text-[10px] text-cs-orange tracking-widest uppercase mb-1">买枪建议</p>
                                                <p className="text-yellow-400 text-lg">{state.aiAdvice.buyAdvice}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 提示 */}
                            <div className="glass-panel rounded-xl p-4 text-center">
                                <p className="text-white/40 text-xs">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                    将以上战术建议告诉队友，执行配合
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="glass-panel rounded-xl p-8 flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-white/10 text-6xl">sports_esports</span>
                                <p className="text-white/30 text-sm mt-4">回合进行中...</p>
                                <p className="text-white/20 text-xs mt-1">AI 将在下回合买枪期给出战术建议</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 底部状态 */}
            <footer className="flex items-center justify-between px-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-500">游戏中</span>
                </span>
                <span>Session: {sessionId}</span>
            </footer>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="hud-dashboard-layout min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cs-orange"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
