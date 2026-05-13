'use client';
import React from 'react';

const logs = [
    {
        version: 'V2.4.0',
        title: '架构重构与地图扩展',
        date: '2024.11.12',
        changes: [
            '新增 Overpass 完整 GSI 数据支持，优化下包后站位热图精度。',
            '重构 GSI 信号处理层，降低端到端延迟至 0.04ms 级别。',
            '引入 "Shadow Move" 算法，预测对手在烟雾弹覆盖下的转点倾向。'
        ]
    },
    {
        version: 'V2.3.5',
        title: 'UI 视觉系统 2.0 升级',
        date: '2024.10.28',
        changes: [
            '全局引入 Glassmorphism 材质系统，提升在不同地图背景下的可读性。',
            '新增战术回放模式，支持 3D 自由视角审视道具落点误差。',
            '优化手机端网页适配，确保在比赛间隙快速同步战术思路。'
        ]
    },
    {
        version: 'V2.2.0',
        title: '经济建模引擎上线',
        date: '2024.09.15',
        changes: [
            '正式发布 "Economy Predictor"，根据实时胜率动态调整购买建议。',
            '整合 Faceit API，自动同步战队竞技等级与天梯表现。',
            '修复了在 Ancient 地图中 B 区水位数据回传异常的 Bug。'
        ]
    }
];

export default function ChangelogPage() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="fixed inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FF7A00 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>

            <header className="fixed top-0 z-50 w-full glass-panel border-b border-white/5">
                <div className="mx-auto max-w-[1400px] px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/cs2logo.png" alt="CS2 Tactics" className="h-10" />
                    </div>
                    <nav className="hidden lg:flex items-center gap-10">
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/tactics">战术库</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/dashboard">决策中心</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/leaderboard">排行榜</a>
                        <a className="text-cs-orange text-xs tracking-[0.2em] transition-all border-b border-cs-orange pb-1" href="/changelog">开发日志</a>
                    </nav>
                    <div className="flex items-center gap-6">
                        <button className="text-white/60 text-xs tracking-widest hover:text-white transition-colors">登录系统</button>
                        <button className="btn-outline !py-2 !px-5 !text-xs tracking-widest uppercase">建立连接</button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-40 pb-24">
                <div className="mx-auto max-w-[1000px] px-6">
                    <div className="mb-20">
                        <h2 className="text-cs-orange text-sm tracking-[0.6em] mb-4">LOGBOOK / 产品进化历程</h2>
                        <h1 className="text-5xl md:text-7xl text-white mb-6">开发日志</h1>
                        <p className="text-slate-400 text-lg max-w-2xl font-technical">
                            追踪每一项技术突破与系统迭代。从 GSI 数据链路优化到 AI 决策算法的演进，我们始终致力于提供最极致的竞技辅助体验。
                        </p>
                    </div>

                    <div className="relative pl-10 md:pl-16">
                        <div className="timeline-line"></div>
                        {logs.map((log, index) => (
                            <div key={log.version} className="relative mb-16">
                                <div className="timeline-dot"></div>
                                <div className="glass-panel p-8 md:p-10 hover:border-cs-orange/30 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <span className="bg-cs-orange text-white px-3 py-1 text-sm font-headline tracking-tighter orange-glow">{log.version}</span>
                                            <h3 className="text-white text-2xl font-headline">{log.title}</h3>
                                        </div>
                                        <div className="text-cs-orange/60 font-technical text-sm tracking-widest">{log.date}</div>
                                    </div>
                                    <ul className="space-y-4 text-slate-400 text-sm md:text-base font-technical">
                                        {log.changes.map((change, cIndex) => (
                                            <li key={cIndex} className="flex items-start gap-3">
                                                <span className="text-cs-orange mt-1">/</span>
                                                <span>{change}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                        <div className="relative">
                            <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-cs-orange/30"></div>
                            <div className="text-slate-600 text-xs tracking-widest pl-4 font-technical uppercase">INITIALIZATION COMPLETE // SYSTEM ONLINE</div>
                        </div>
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
