'use client';
import React from 'react';

const tactics = [
    {
        id: 'TACT_0492',
        title: 'Mirage A-Execute (2018)',
        map: 'Mirage',
        side: 'T-SIDE',
        team: 'Astralis Classic',
        views: '42.1K',
        items: '12 道具',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8HqCbLA6sDTs93c2l3afqtbVC4sArmaaV5SxdDvyA8M9EUbaMlY6PoUu1uE8ydNcWGltmyQZ7jp0_CDyJg-xsYH7-RS5mu-ZfCZrr97OdZBVWZ-HsAAFqbbIovypDlJ1yjkGzxAjZpV-Vl9m0qOGNtkkaHLXE6gV6cOK_KIpqy37U1wsRoOmxCGjOeASNsq5nkFmsYPrdXJSi3v-mLDJn8pUoSJw0L9vK5PuUzCNbwk-HiI6KeMJq6MQ5_6VPNClnWyCOSE7qoIU'
    },
    {
        id: 'TACT_1108',
        title: 'Ramp Push Denial',
        map: 'Nuke',
        side: 'CT-SIDE',
        team: 'Aggressive Setup',
        views: '18.5K',
        items: '8 道具',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXiwgpbkC-S5qhmhBbG3cxuqOCd0LC8FSVunRXAwo9kCtVcLLdxQBFa-qmPJnq30Ye09hujcahlfCEL-yOBBY7mFnWfUQKtcbN6H1iw8daAhU1FYDywrg5qGSdD0YGdStaTtjA9Vy0PRdqqL4XdG3kudWW80UH-W_IxdvPL8TgLSD4LxVL6eg2r6CgZiviUL6g7Z7PC7xULOLMSyKi0uw-eJGvFufQ0OjUHMG2x3phSp25hWXQced4kwM4PJ3_aUw7t24tSkZtstE'
    },
    {
        id: 'TACT_2290',
        title: 'Banana Control to B-Split',
        map: 'Inferno',
        side: 'T-SIDE',
        team: 'Lategame Execute',
        views: '33.7K',
        items: '15 道具',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8HqCbLA6sDTs93c2l3afqtbVC4sArmaaV5SxdDvyA8M9EUbaMlY6PoUu1uE8ydNcWGltmyQZ7jp0_CDyJg-xsYH7-RS5mu-ZfCZrr97OdZBVWZ-HsAAFqbbIovypDlJ1yjkGzxAjZpV-Vl9m0qOGNtkkaHLXE6gV6cOK_KIpqy37U1wsRoOmxCGjOeASNsq5nkFmsYPrdXJSi3v-mLDJn8pUoSJw0L9vK5PuUzCNbwk-HiI6KeMJq6MQ5_6VPNClnWyCOSE7qoIU'
    },
    {
        id: 'TACT_0812',
        title: 'Mid-Aggro Fast Flank',
        map: 'Ancient',
        side: 'CT-SIDE',
        team: 'Eco Strategy',
        views: '12.2K',
        items: '4 道具',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXiwgpbkC-S5qhmhBbG3cxuqOCd0LC8FSVunRXAwo9kCtVcLLdxQBFa-qmPJnq30Ye09hujcahlfCEL-yOBBY7mFnWfUQKtcbN6H1iw8daAhU1FYDywrg5qGSdD0YGdStaTtjA9Vy0PRdqqL4XdG3kudWW80UH-W_IxdvPL8TgLSD4LxVL6eg2r6CgZiviUL6g7Z7PC7xULOLMSyKi0uw-eJGvFufQ0OjUHMG2x3phSp25hWXQced4kwM4PJ3_aUw7t24tSkZtstE'
    },
    {
        id: 'TACT_5541',
        title: 'Water Control Pop-Flash A',
        map: 'Anubis',
        side: 'T-SIDE',
        team: 'Masterclass',
        views: '25.4K',
        items: '11 道具',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8HqCbLA6sDTs93c2l3afqtbVC4sArmaaV5SxdDvyA8M9EUbaMlY6PoUu1uE8ydNcWGltmyQZ7jp0_CDyJg-xsYH7-RS5mu-ZfCZrr97OdZBVWZ-HsAAFqbbIovypDlJ1yjkGzxAjZpV-Vl9m0qOGNtkkaHLXE6gV6cOK_KIpqy37U1wsRoOmxCGjOeASNsq5nkFmsYPrdXJSi3v-mLDJn8pUoSJw0L9vK5PuUzCNbwk-HiI6KeMJq6MQ5_6VPNClnWyCOSE7qoIU'
    },
    {
        id: 'TACT_0023',
        title: 'Long A Crossfire Setup',
        map: 'Dust 2',
        side: 'CT-SIDE',
        team: 'Passive Hold',
        views: '14.8K',
        items: '6 道具',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXiwgpbkC-S5qhmhBbG3cxuqOCd0LC8FSVunRXAwo9kCtVcLLdxQBFa-qmPJnq30Ye09hujcahlfCEL-yOBBY7mFnWfUQKtcbN6H1iw8daAhU1FYDywrg5qGSdD0YGdStaTtjA9Vy0PRdqqL4XdG3kudWW80UH-W_IxdvPL8TgLSD4LxVL6eg2r6CgZiviUL6g7Z7PC7xULOLMSyKi0uw-eJGvFufQ0OjUHMG2x3phSp25hWXQced4kwM4PJ3_aUw7t24tSkZtstE'
    }
];

export default function TacticsPage() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="fixed inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FF7A00 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>

            <header className="fixed top-0 z-50 w-full glass-panel border-b border-white/5">
                <div className="mx-auto max-w-[1400px] px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/cs2logo.png" alt="CS2 Tactics" className="h-10" />
                    </div>
                    <nav className="hidden lg:flex items-center gap-10">
                        <a className="text-cs-orange text-xs tracking-[0.2em] transition-all border-b border-cs-orange pb-1" href="/tactics">战术库</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/dashboard">决策中心</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/leaderboard">排行榜</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/changelog">开发日志</a>
                    </nav>
                    <div className="flex items-center gap-6">
                        <button className="text-white/60 text-xs tracking-widest hover:text-white transition-colors">登录系统</button>
                        <button className="btn-outline !py-2 !px-5 !text-xs tracking-widest uppercase">建立连接</button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-32 pb-24">
                <div className="mx-auto max-w-[1400px] px-8">
                    <div className="mb-12">
                        <h2 className="text-5xl md:text-7xl text-white mb-4">史诗级战术回顾</h2>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <p className="text-slate-400 max-w-2xl font-technical">
                                探索 CS 历史上的经典时刻。从 Astralis 的实用道具覆盖到 NAVI 的极限转点，所有战术均已数字化并适配 CS2 引擎。
                            </p>
                            <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                                <button className="filter-btn filter-btn-active">全部地图</button>
                                {['Mirage', 'Inferno', 'Nuke', 'Ancient', 'Anubis'].map(m => (
                                    <button key={m} className="filter-btn">{m}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tactics.map((t) => (
                            <div key={t.id} className="glass-panel group card-hover relative overflow-hidden transition-all duration-500 cursor-pointer">
                                <div className="aspect-video relative overflow-hidden">
                                    <div className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-transform duration-700 blur-[2px] group-hover:blur-0" style={{ backgroundImage: `url('${t.image}')` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-grey via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="px-2 py-1 glass-panel text-[10px] text-white/80 uppercase tracking-widest">{t.map}</span>
                                        <span className={`px-2 py-1 text-[10px] text-white uppercase tracking-widest font-bold ${t.side === 'T-SIDE' ? 'bg-cs-orange' : 'bg-blue-600'}`}>{t.side}</span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-8 h-[1px] bg-cs-orange"></span>
                                        <span className="text-[10px] text-cs-orange uppercase tracking-[0.3em]">{t.team}</span>
                                    </div>
                                    <h4 className="text-2xl text-white mb-6 group-hover:text-cs-orange transition-colors">{t.title}</h4>
                                    <div className="flex items-center justify-between text-slate-500 text-[10px] font-technical">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {t.views}</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">description</span> {t.items}</span>
                                        </div>
                                        <span className="text-white/40 tracking-widest">ID: {t.id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <button className="btn-primary flex items-center gap-3 mx-auto px-12 py-5 text-xl tracking-[0.2em] uppercase">
                            <span className="material-symbols-outlined">expand_more</span>
                            加载更多战术
                        </button>
                    </div>
                </div>
            </main>

            <footer className="bg-navy-grey/80 border-t border-white/5 py-16 px-8 relative z-10">
                <div className="mx-auto max-w-[1400px]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-3">
                            <img src="/cs2logo.png" alt="CS2 Tactics" className="h-8" />
                        </div>
                        <div className="flex flex-wrap justify-center gap-10 text-slate-500 text-[10px] tracking-[0.4em] uppercase font-technical">
                            <a className="hover:text-cs-orange transition-colors" href="#">系统状态</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">安全文档</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">API 接口</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">全球网络</a>
                        </div>
                        <div className="text-slate-600 text-[10px] tracking-widest font-technical">VER 4.2.0_STABLE // BUILD_2024.11</div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5 text-center text-slate-600 text-[10px] tracking-[0.3em] uppercase font-technical">© 2024 CS2 Tactics Intelligence. 为竞技巅峰而生.</div>
                </div>
            </footer>
        </div>
    );
}
