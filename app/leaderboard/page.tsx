'use client';
import React from 'react';

const rankings = [
    { rank: '#04', id: 'STRAT_MASTER_99', wins: 642, winRate: '59.2%', status: 'ONLINE', statusColor: 'text-green-500/80 border-green-500/20' },
    { rank: '#05', id: 'PIXEL_PERFECT', wins: 618, winRate: '58.7%', status: 'OFFLINE', statusColor: 'text-slate-600 border-white/5' },
    { rank: '#06', id: 'ECHO_LOCATION', wins: 595, winRate: '57.1%', status: 'ONLINE', statusColor: 'text-green-500/80 border-green-500/20' },
    { rank: '#07', id: 'SHADOW_STRIKE', wins: 542, winRate: '55.8%', status: 'OFFLINE', statusColor: 'text-slate-600 border-white/5' },
    { rank: '#08', id: 'VORTEX_TMT', wins: 521, winRate: '54.2%', status: 'IN-GAME', statusColor: 'text-cs-orange/80 border-cs-orange/20' }
];

export default function LeaderboardPage() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="fixed inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FF7A00 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>

            <header className="fixed top-0 z-50 w-full glass-panel border-b border-white/5">
                <div className="mx-auto max-w-[1400px] px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-cs-orange text-3xl">radar</span>
                        <a href="/" className="text-white text-2xl tracking-tighter">CS2 <span className="text-cs-orange">TACTICS</span></a>
                    </div>
                    <nav className="hidden lg:flex items-center gap-10">
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/tactics">战术库</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/dashboard">决策中心</a>
                        <a className="text-cs-orange text-xs tracking-[0.2em] transition-all border-b border-cs-orange pb-1" href="/leaderboard">排行榜</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/changelog">开发日志</a>
                    </nav>
                    <div className="flex items-center gap-6">
                        <button className="text-white/60 text-xs tracking-widest hover:text-white transition-colors">登录系统</button>
                        <button className="btn-outline !py-2 !px-5 !text-xs tracking-widest uppercase">建立连接</button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-32 pb-24 relative z-10">
                <div className="mx-auto max-w-[1200px] px-6">
                    <div className="mb-16 text-center">
                        <h2 className="text-cs-orange text-sm tracking-[0.6em] mb-4">SEASON 02 / 战绩巅峰榜</h2>
                        <h3 className="text-5xl md:text-7xl text-white mb-6">用户排行榜</h3>
                        <p className="text-slate-500 text-sm tracking-widest font-technical uppercase">Real-time engagement metrics and competitive dominance</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
                        <div className="order-2 md:order-1">
                            <div className="glass-panel p-8 text-center relative group border-white/10 flex flex-col items-center">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-700 px-4 py-1 text-[10px] text-white tracking-widest">RANK 02</div>
                                <div className="w-20 h-20 rounded-full border border-white/20 mb-6 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-4xl text-slate-400 font-light">person</span>
                                </div>
                                <h4 className="text-xl text-white mb-2 font-headline">NEO_RECON</h4>
                                <div className="text-cs-orange text-2xl font-headline mb-4">842 WINS</div>
                                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
                                <div className="text-[10px] text-slate-500 tracking-widest font-technical">WIN RATE: 64.2%</div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2">
                            <div className="glass-panel p-12 text-center relative group border-cs-orange/30 orange-glow flex flex-col items-center scale-110 z-20">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-cs-orange px-6 py-2 text-xs text-white tracking-[0.3em] orange-glow">TOP ALPHA</div>
                                <div className="w-28 h-28 rounded-full border-2 border-cs-orange/50 mb-8 flex items-center justify-center overflow-hidden p-1">
                                    <div className="w-full h-full rounded-full bg-cs-orange/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl text-cs-orange">military_tech</span>
                                    </div>
                                </div>
                                <h4 className="text-3xl text-white mb-3 tracking-tighter font-headline">PHANTOM_ACE</h4>
                                <div className="text-cs-orange text-4xl font-headline mb-6">1,204 WINS</div>
                                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cs-orange/20 to-transparent mb-6"></div>
                                <div className="flex gap-8">
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500 tracking-widest mb-1 font-technical uppercase">WIN RATE</div>
                                        <div className="text-white text-sm font-technical">78.4%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-500 tracking-widest mb-1 font-technical uppercase">LEVEL</div>
                                        <div className="text-white text-sm font-technical">ELITE 10</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-3 md:order-3">
                            <div className="glass-panel p-8 text-center relative group border-white/10 flex flex-col items-center">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#78350f] px-4 py-1 text-[10px] text-white tracking-widest">RANK 03</div>
                                <div className="w-20 h-20 rounded-full border border-white/20 mb-6 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-4xl text-slate-400 font-light">person</span>
                                </div>
                                <h4 className="text-xl text-white mb-2 font-headline">GHOST_WALKER</h4>
                                <div className="text-cs-orange text-2xl font-headline mb-4">756 WINS</div>
                                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
                                <div className="text-[10px] text-slate-500 tracking-widest font-technical">WIN RATE: 61.8%</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-8 py-6 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-headline">Rank</th>
                                    <th className="px-8 py-6 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-headline">User ID</th>
                                    <th className="px-8 py-6 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-headline">Wins</th>
                                    <th className="px-8 py-6 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-headline">Win Rate</th>
                                    <th className="px-8 py-6 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-headline text-right">Activity Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-technical">
                                {rankings.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 text-sm text-slate-400">{r.rank}</td>
                                        <td className="px-8 py-5 text-white text-sm group-hover:text-cs-orange transition-colors">{r.id}</td>
                                        <td className="px-8 py-5 text-white font-headline text-lg">{r.wins}</td>
                                        <td className="px-8 py-5 text-sm text-slate-400">{r.winRate}</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`text-[10px] border px-2 py-1 rounded ${r.statusColor}`}>{r.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button className="btn-outline !text-[10px] !px-12 !py-3 tracking-[0.4em] uppercase">加载更多战绩数据</button>
                    </div>
                </div>
            </main>

            <footer className="bg-navy-grey/80 border-t border-white/5 py-16 px-8 relative z-10">
                <div className="mx-auto max-w-[1400px]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-cs-orange text-2xl">radar</span>
                            <h2 className="text-white text-lg tracking-tighter">CS2 <span className="text-cs-orange">TACTICS</span></h2>
                        </div>
                        <div className="flex flex-wrap justify-center gap-10 text-slate-500 text-[10px] tracking-[0.4em] uppercase font-technical">
                            <a className="hover:text-cs-orange transition-colors" href="#">系统状态</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">安全文档</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">API 接口</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">全球网络</a>
                        </div>
                        <div className="text-slate-600 text-[10px] tracking-widest font-technical">RANKING_SYSTEM_v2.4 // SYNC_LATEST: 2024.11.24_18:00</div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5 text-center text-slate-600 text-[10px] tracking-[0.3em] uppercase font-technical">© 2024 CS2 Tactics Intelligence. 为竞技巅峰而生.</div>
                </div>
            </footer>
        </div>
    );
}
