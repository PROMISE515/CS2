'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Pusher from 'pusher-js';
import * as Beams from '@pusher/push-notifications-web';
import { Shield, MapPin, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

function DashboardContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('s') || 'debug_user_123';
    const [state, setState] = useState<any>(null);

    useEffect(() => {
        // Validate environment variables before initializing Pusher
        if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            console.error('❌ Missing Pusher environment variables!');
            console.error('Required: NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER');
            console.error('Please configure in Vercel and redeploy.');
            return;
        }

        // 1. 初始化 Pusher 实时更新
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe(`session-${sessionId}`);
        channel.bind('state-update', (data: any) => {
            setState(data);
        });

        // 2. 初始化 Pusher Beams 浏览器通知（可选）
        if (process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID) {
            try {
                const beamsClient = new Beams.Client({
                    instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID,
                });
                beamsClient.start()
                    .then(() => beamsClient.addDeviceInterest(`user-${sessionId}`))
                    .catch(console.error);
            } catch (error) {
                console.warn('Beams initialization failed (optional feature):', error);
            }
        }

        return () => {
            pusher.unsubscribe(`session-${sessionId}`);
        };
    }, [sessionId]);

    if (!state) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mb-4"></div>
                <p>正在等待 CS2 数据连接...</p>
                <p className="text-xs mt-2 opacity-50">Session: {sessionId}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="text-orange-500" />
                        STRATLOG <span className="text-xs font-normal opacity-40">v2.0 CLOUD</span>
                    </h1>
                    <p className="text-[10px] opacity-50 uppercase tracking-widest mt-1">
                        Map: {state.map} • Round {state.round}
                    </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${state.economy === 'FULL_BUY' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
                    state.economy === 'ECO' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                        'bg-orange-500/10 border-orange-500/50 text-orange-400'
                    }`}>
                    {state.economy}
                </div>
            </header>

            {/* Tactical Card */}
            <main className="space-y-4">
                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} />
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-6 bg-orange-500 rounded-full" />
                        <h2 className="text-lg font-bold text-orange-500 uppercase">当前战术指令</h2>
                    </div>

                    <h3 className="text-2xl font-bold mb-4">{state.tactic.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        {state.tactic.description}
                    </p>

                    <div className="space-y-4">
                        {state.tactic.steps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                <div className="text-sky-400 mt-0.5">
                                    <Clock size={16} />
                                </div>
                                <span className="text-slate-200 text-sm font-medium">{step}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Emergency Plan */}
                <section className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">应急方案</h4>
                    </div>
                    <p className="text-xs text-amber-200/70">
                        如果 3 人进攻点位受阻，立即转向 B 点执行 4-1 分推。
                    </p>
                </section>
            </main>

            <footer className="mt-8 text-center opacity-30 text-[10px] space-y-1">
                <p>CONNECTED TO {sessionId}</p>
                <p>© 2026 STRATLOG.CC ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
