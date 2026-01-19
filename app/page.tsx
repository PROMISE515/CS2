'use client';
import React from 'react';

export default function Home() {
    const sessionId = "debug_user_123";
    const dashboardUrl = `https://cs-2-coral.vercel.app/dashboard?s=${sessionId}`;

    const downloadConfig = () => {
        const cfgContent = `"StratLog GSI v2.0"
{
    "uri"           "https://cs-2-coral.vercel.app/api/gsi"
    "timeout"       "5.0"
    "buffer"        "0.1"
    "throttle"      "0.5"
    "heartbeat"     "30.0"
    "data"
    {
        "map"                   "1"
        "round"                 "1"
        "player_id"             "1"
        "player_state"          "1"
        "player_weapons"        "1"
        "player_match_stats"    "1"
        "phase_countdowns"      "1"
    }
    "auth"
    {
        "sessionId" "${sessionId}"
    }
}`;
        const blob = new Blob([cfgContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gamestate_integration_stratlog.cfg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            {/* Background Grain */}
            <div className="fixed inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FF7A00 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>

            <header className="fixed top-0 z-50 w-full glass-panel border-b border-white/5">
                <div className="mx-auto max-w-[1400px] px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-cs-orange text-3xl">radar</span>
                        <h1 className="text-white text-2xl tracking-tighter">CS2 <span className="text-cs-orange">TACTICS</span></h1>
                    </div>
                    <nav className="hidden lg:flex items-center gap-10">
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="#">战术库</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="/dashboard">决策中心</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="#">排行榜</a>
                        <a className="text-white/60 hover:text-cs-orange text-xs tracking-[0.2em] transition-all" href="#">开发日志</a>
                    </nav>
                    <div className="flex items-center gap-6">
                        <button className="text-white/60 text-xs tracking-widest hover:text-white transition-colors">登录系统</button>
                        <a href={dashboardUrl} className="btn-outline !py-2 !px-5 !text-xs tracking-widest flex items-center">建立连接</a>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-40 pb-24 min-h-screen flex items-center justify-center">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-navy-grey/20 via-navy-grey/90 to-navy-grey z-10"></div>
                        <div
                            className="w-full h-full bg-cover bg-center opacity-30 grayscale contrast-125"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8HqCbLA6sDTs93c2l3afqtbVC4sArmaaV5SxdDvyA8M9EUbaMlY6PoUu1uE8ydNcWGltmyQZ7jp0_CDyJg-xsYH7-RS5mu-ZfCZrr97OdZBVWZ-HsAAFqbbIovypDlJ1yjkGzxAjZpV-Vl9m0qOGNtkkaHLXE6gV6cOK_KIpqy37U1wsRoOmxCGjOeASNsq5nkFmsYPrdXJSi3v-mLDJn8pUoSJw0L9vK5PuUzCNbwk-HiI6KeMJq6MQ5_6VPNClnWyCOSE7qoIU')" }}
                        ></div>
                    </div>
                    <div className="relative z-20 max-w-[1200px] px-6 text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2 glass-panel border-cs-orange/30 text-cs-orange text-[10px] tracking-[0.4em] uppercase mb-10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cs-orange opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cs-orange"></span>
                            </span>
                            系统协议 2.0 已激活
                        </div>
                        <h1 className="text-white text-6xl md:text-8xl lg:text-9xl mb-8 leading-none">
                            CS2 战术决策系统<br />
                            <span className="text-cs-orange italic">主宰信息态战场</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-[850px] mx-auto mb-14 tracking-wide leading-relaxed">
                            为现代 CS2 职业选手打造的高保真战术同步系统。利用实时 GSI 数据优化每一次转点决策与道具投掷，掌控全局经济态势。
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button onClick={downloadConfig} className="btn-primary w-full sm:w-auto tracking-[0.2em] text-center flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">download</span>
                                下载连接器
                            </button>
                            <a href={dashboardUrl} className="btn-outline w-full sm:w-auto tracking-[0.2em] !bg-white/5 !border-white/10 !text-white hover:!bg-white/10 text-center">进入控制中心</a>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 px-6 relative z-10">
                    <div className="mx-auto max-w-[1200px]">
                        <div className="mb-20 text-center">
                            <h2 className="text-cs-orange text-sm tracking-[0.6em] mb-4">核心系统 / CORE SYSTEMS</h2>
                            <h3 className="text-4xl md:text-6xl text-white">技术驱动的 <span className="text-slate-600 italic">压制力</span></h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-panel p-10 relative group border-white/5">
                                <div className="size-14 glass-panel border-cs-orange/50 flex items-center justify-center mb-10 group-hover:bg-cs-orange/20 transition-colors">
                                    <span className="material-symbols-outlined text-cs-orange text-3xl">sensors</span>
                                </div>
                                <h4 className="text-2xl text-white mb-5 tracking-tight">实时 GSI 数据同步</h4>
                                <p className="text-slate-400 leading-relaxed text-sm">直接集成 CS2 游戏状态。在副屏幕上零延迟监控血量、道具余量及队友站位信息。</p>
                                <div className="mt-10 hud-progress w-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="glass-panel p-10 relative group border-white/5">
                                <div className="size-14 glass-panel border-cs-orange/50 flex items-center justify-center mb-10 group-hover:bg-cs-orange/20 transition-colors">
                                    <span className="material-symbols-outlined text-cs-orange text-3xl">payments</span>
                                </div>
                                <h4 className="text-2xl text-white mb-5 tracking-tight">智能经济建模系统</h4>
                                <p className="text-slate-400 leading-relaxed text-sm">预测性财务分析。根据连败奖金和生存率，精准推演对手下一局的购买力及枪械配置。</p>
                                <div className="mt-10 hud-progress w-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="glass-panel p-10 relative group border-white/5">
                                <div className="size-14 glass-panel border-cs-orange/50 flex items-center justify-center mb-10 group-hover:bg-cs-orange/20 transition-colors">
                                    <span className="material-symbols-outlined text-cs-orange text-3xl">memory</span>
                                </div>
                                <h4 className="text-2xl text-white mb-5 tracking-tight">AI 辅助决策引擎</h4>
                                <p className="text-slate-400 leading-relaxed text-sm">神经网络分析热图与击杀流，实时推荐最佳转点路径和下包后的防守站位。</p>
                                <div className="mt-10 hud-progress w-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Demo Section */}
                <section className="py-32 relative bg-white/[0.01]">
                    <div className="mx-auto max-w-[1200px] px-6 text-center">
                        <div className="flex flex-col items-center mb-16">
                            <div className="h-1 w-24 bg-cs-orange mb-10 orange-glow"></div>
                            <h2 className="text-white text-4xl md:text-5xl">多端实时同步演示</h2>
                        </div>

                        <div className="glass-panel p-8 mb-12 max-w-2xl mx-auto border-cs-orange/20">
                            <p className="text-cs-orange text-xs tracking-[0.4em] uppercase mb-4">你的实时控制台</p>
                            <div className="bg-white/5 p-4 rounded-lg mb-6 border border-white/5">
                                <code className="text-white font-technical text-sm break-all">{dashboardUrl}</code>
                            </div>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                                Session ID: <span className="text-white font-mono">{sessionId}</span>
                            </p>
                        </div>

                        <div className="relative glass-panel p-6 rounded-none border-white/5 shadow-2xl overflow-hidden aspect-video">
                            <div className="absolute inset-0 z-0 bg-cover bg-center grayscale contrast-75 brightness-50" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXiwgpbkC-S5qhmhBbG3cxuqOCd0LC8FSVunRXAwo9kCtVcLLdxQBFa-qmPJnq30Ye09hujcahlfCEL-yOBBY7mFnWfUQKtcbN6H1iw8daAhU1FYDywrg5qGSdD0YGdStaTtjA9Vy0PRdqqL4XdG3kudWW80UH-W_IxdvPL8TgLSD4LxVL6eg2r6CgZiviUL6g7Z7PC7xULOLMSyKi0uw-eJGvFufQ0OjUHMG2x3phSp25hWXQced4kwM4PJ3_aUw7t24tSkZtstE')" }}></div>
                            <div className="relative z-10 w-full h-full flex items-center justify-around">
                                <div className="w-2/3 h-4/5 glass-panel border-white/10 relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute top-4 left-4 text-[10px] text-cs-orange">GSI_LATENCY: 0.04ms // FREQ: 128tick</div>
                                    <span className="material-symbols-outlined text-8xl text-white/5">grid_view</span>
                                    <div className="absolute bottom-4 right-4 flex gap-1">
                                        <div className="h-1 w-12 bg-cs-orange"></div>
                                        <div className="h-1 w-6 bg-white/10"></div>
                                    </div>
                                </div>
                                <div className="w-1/5 h-3/5 border-2 border-white/10 bg-navy-grey relative flex flex-col items-center justify-center shadow-2xl translate-y-8">
                                    <span className="material-symbols-outlined text-4xl text-cs-orange mb-3">smartphone</span>
                                    <div className="text-[8px] text-cs-orange uppercase animate-pulse">UPLINK_SYNCING...</div>
                                    <div className="mt-4 w-4/5 h-1/3 border border-white/5 bg-white/5 flex items-center justify-center">
                                        <div className="text-[6px] text-white/40 uppercase">Map_Overlay</div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 2px 100%' }}></div>
                        </div>
                    </div>
                </section>

                {/* Download Section */}
                <section className="py-32 px-6 relative">
                    <div className="mx-auto max-w-[1000px] text-center">
                        <div className="glass-panel p-12 md:p-24 relative overflow-hidden">
                            <div className="absolute -top-32 -left-32 size-80 bg-cs-orange/5 rounded-full blur-[100px]"></div>
                            <div className="absolute -bottom-32 -right-32 size-80 bg-cs-orange/5 rounded-full blur-[100px]"></div>
                            <div className="relative z-10">
                                <h2 className="text-white text-5xl md:text-7xl mb-8 italic">下载中心</h2>
                                <p className="text-slate-400 text-lg mb-14 max-w-xl mx-auto">部署轻量级配置助手，将您的本地游戏数据与 CS2 Tactics 云端决策引擎无缝对接。</p>
                                <button onClick={downloadConfig} className="btn-primary flex items-center gap-3 mx-auto mb-20 px-12 py-6 text-xl">
                                    <span className="material-symbols-outlined">download</span>
                                    📥 立即下载 GSI 配置文件
                                </button>
                                <div className="text-left border-t border-white/10 pt-16">
                                    <h3 className="text-white text-xl mb-12 flex items-center gap-4">
                                        <span className="w-12 h-1 bg-cs-orange"></span>
                                        快速安装指南
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                        <div>
                                            <div className="text-2xl text-cs-orange/30 italic mb-4">#01</div>
                                            <h5 className="text-white font-headline text-sm mb-3">运行程序</h5>
                                            <p className="text-[11px] text-slate-500 uppercase leading-relaxed">软件已通过数字签名认证，后台极简占用。</p>
                                        </div>
                                        <div>
                                            <div className="text-2xl text-cs-orange/30 italic mb-4">#02</div>
                                            <h5 className="text-white font-headline text-sm mb-3">身份授权</h5>
                                            <p className="text-[11px] text-slate-500 uppercase leading-relaxed">接入您的 UID 以启用多端同步功能。</p>
                                        </div>
                                        <div>
                                            <div className="text-2xl text-cs-orange/30 italic mb-4">#03</div>
                                            <div className="hud-progress w-full mb-4"></div>
                                            <h5 className="text-white font-headline text-sm mb-3">GSI 自动化</h5>
                                            <p className="text-[11px] text-slate-500 uppercase leading-relaxed">一键配置 CS2 GSI 节点，即刻开始数据实战。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-navy-grey/80 border-t border-white/5 py-16 px-8 relative z-10">
                <div className="mx-auto max-w-[1400px]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-cs-orange text-2xl">radar</span>
                            <h2 className="text-white text-lg tracking-tighter">CS2 <span className="text-cs-orange">TACTICS</span></h2>
                        </div>
                        <div className="flex flex-wrap justify-center gap-10 text-slate-500 text-[10px] tracking-[0.4em] uppercase">
                            <a className="hover:text-cs-orange transition-colors" href="#">系统状态</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">安全文档</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">API 接口</a>
                            <a className="hover:text-cs-orange transition-colors" href="#">全球网络</a>
                        </div>
                        <div className="text-slate-600 text-[10px] tracking-widest font-technical">
                            VER 4.2.0_STABLE // BUILD_2026.01
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5 text-center text-slate-600 text-[10px] tracking-[0.3em] uppercase">
                        © 2026 CS2 Tactics Intelligence. 为竞技巅峰而生.
                    </div>
                </div>
            </footer>
        </div>
    );
}
