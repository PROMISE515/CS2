'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Pusher from 'pusher-js';
import * as Beams from '@pusher/push-notifications-web';

function DashboardContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('s') || 'debug_user_123';
    const [state, setState] = useState<any>(null);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            console.error('❌ Missing Pusher environment variables!');
            return;
        }

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe(`session-${sessionId}`);
        channel.bind('state-update', (data: any) => {
            setState(data);
        });

        if (process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID) {
            try {
                const beamsClient = new Beams.Client({
                    instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID,
                });
                beamsClient.start()
                    .then(() => beamsClient.addDeviceInterest(`user-${sessionId}`))
                    .catch(console.error);
            } catch (error) {
                console.warn('Beams initialization failed:', error);
            }
        }

        return () => {
            pusher.unsubscribe(`session-${sessionId}`);
        };
    }, [sessionId]);

    if (!state) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-primary/60">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary mb-6 shadow-[0_0_20px_rgba(255,123,0,0.3)]"></div>
                <div className="hud-corner hud-tl !w-4 !h-4"></div>
                <div className="hud-corner hud-br !w-4 !h-4"></div>
                <p className="font-Technical uppercase tracking-[0.3em] text-sm font-bold">Initializing Uplink...</p>
                <p className="text-[10px] mt-4 opacity-50 font-mono">Session: {sessionId}</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col p-4 md:p-6 gap-6 relative z-10 overflow-hidden">
            {/* Scanline Layer */}
            <div className="scanline top-0"></div>

            {/* Header / Top Bar */}
            <header className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 px-4 md:px-8 py-4 rounded-xl relative">
                <div className="hud-corner hud-tl"></div>
                <div className="hud-corner hud-tr"></div>

                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary scale-125">radar</span>
                        <h2 className="text-white text-lg md:text-2xl font-bold tracking-tighter uppercase whitespace-nowrap">Tactical HUD</h2>
                    </div>
                    <div className="h-8 w-[1px] bg-white/20 hidden sm:block"></div>
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Map</span>
                            <span className="text-sm md:text-lg font-medium">{state.map?.toUpperCase() || 'UNKNOWN'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Round</span>
                            <span className="text-sm md:text-lg font-medium">{state.round || '0'} / 24</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-6">
                    <div className={`px-4 h-10 flex items-center justify-center rounded-lg text-[10px] font-bold tracking-widest uppercase border ${state.economy === 'FULL_BUY' ? 'bg-green-500/10 border-green-500/40 text-green-400' :
                            state.economy === 'ECO' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                                'bg-primary/10 border-primary/40 text-primary'
                        }`}>
                        {state.economy || 'ANALYZING...'}
                    </div>
                </div>
            </header>

            <main className="flex flex-1 gap-6 overflow-hidden flex-col md:flex-row">
                {/* Left Sidebar: Tactics */}
                <div className="flex flex-col gap-6 md:w-1/3 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Tactical Card */}
                    <div className="flex flex-col flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden relative">
                        <div className="hud-corner hud-tr !w-4 !h-4"></div>
                        <div className="hud-corner hud-bl !w-4 !h-4"></div>

                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <h2 className="text-white tracking-tighter text-xl font-bold uppercase flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">strategy</span>
                                {state.tactic?.title || 'Tactical Plan'}
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-white/60 text-xs italic mb-4 leading-relaxed">
                                {state.tactic?.description}
                            </p>

                            <div className="space-y-4">
                                {state.tactic?.steps?.map((step: string, i: number) => (
                                    <div key={i} className="grid grid-cols-[30px_1fr] gap-x-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="size-8 rounded bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-sm font-bold">{i + 1}</div>
                                            {i < state.tactic.steps.length - 1 && (
                                                <div className="w-[1px] bg-gradient-to-b from-primary/40 to-white/10 h-8 mt-2"></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col py-1">
                                            <p className="text-white text-sm font-bold uppercase tracking-tight leading-tight">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Combat Effectiveness (Placeholder for more data) */}
                    <div className="flex flex-col gap-4 p-6 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                            <p className="text-white text-xs font-bold tracking-widest uppercase opacity-60">Success Probability</p>
                            <p className="text-primary text-lg font-bold font-mono">85%</p>
                        </div>
                        <div className="rounded-full bg-white/5 h-1.5 p-[1px] border border-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Right Content: Map Visualization */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
                        <div className="hud-corner hud-tl"></div>
                        <div className="hud-corner hud-tr"></div>
                        <div className="hud-corner hud-bl"></div>
                        <div className="hud-corner hud-br"></div>

                        {/* Decorative HUD Elements */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ff7b00 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                        <div className="relative w-[90%] md:w-[70%] aspect-square flex items-center justify-center border-2 border-white/5 rounded-full overflow-hidden">
                            <div className="absolute inset-0 border border-primary/20 rounded-full animate-pulse"></div>

                            {/* Tactical Feed overlay */}
                            <div className="absolute top-6 right-6 z-20">
                                <div className="flex items-center gap-2 bg-black/60 border border-primary/40 px-3 py-1 rounded backdrop-blur-md">
                                    <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">UPLINK ACTIVE</span>
                                </div>
                            </div>

                            <img
                                src={`https://cs-2-coral.vercel.app/maps/${state.map?.toLowerCase() || 'mirage'}.png`}
                                alt="Map Preview"
                                className="w-[80%] h-[80%] object-contain filter brightness-125 invert opacity-20"
                                onError={(e: any) => {
                                    e.target.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtrBXppIFGNo1RIbzBberiTyvRciTbl558h6ISWOReSm2O_NZ7Bg-MuxsO3tKFug1aGcSlS-4CtmhwVwfUqpfEKBfp_7f82mt9wJ1w-fiDs3RqKqizdh5CSK53FKykeIACDyyiSZEHL8W3AgBfvlMR256d1A9_c8uRo9eK50nD0OY_P-zAuuF8SFSktlJf4LHL-c5TJM2IWsC-n4rYlbnbIeWzFEraK4Ajnmjtf0p-919SYh1030IYqrP9kLiRm-e98Um1z_b7CWo';
                                }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[12rem] text-primary/10 select-none">radar</span>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-6 text-white/40 text-[10px] font-mono uppercase tracking-widest">
                            System: Online <br /> Latency: 14ms
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer / Status Bar */}
            <footer className="flex items-center justify-between px-2 text-[8px] md:text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                <div className="flex gap-4 md:gap-6">
                    <span className="text-primary italic">Connected to {sessionId}</span>
                </div>
                <div className="flex gap-6 hidden sm:flex">
                    <span>Encryption: AES-256</span>
                    <span className="text-primary/60 tracking-normal">BUILD: 2026.01.19.HUD.v1</span>
                </div>
            </footer>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-navy-grey flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
