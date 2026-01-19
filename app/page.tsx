export default function Home() {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black mb-4 tracking-tighter">STRATLOG <span className="text-orange-500">CS2</span></h1>
            <p className="text-slate-400 mb-8 max-w-md">
                专业级实时战术辅助平台。合规、安全、高效。
            </p>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl mb-8">
                <p className="text-sm text-slate-500 mb-4 uppercase tracking-widest font-bold">扫码进入控制中心</p>
                <div className="w-48 h-48 bg-white rounded-2xl p-4 mx-auto mb-4 flex items-center justify-center">
                    {/* 真实项目中这里可以用 qrcode.react 生成 */}
                    <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center">
                        <p className="text-[8px] text-slate-800 text-center px-4 font-mono font-bold leading-none break-all">
                            https://stratlog-cs2.vercel.app/dashboard?s=debug_user_123
                        </p>
                    </div>
                </div>
                <p className="text-xs text-slate-400 bg-slate-800 py-2 px-4 rounded-full">
                    Session ID: <span className="text-white font-mono">debug_user_123</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl text-left">
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h3 className="font-bold mb-1 text-sm">1. 下载连接器</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        下载 stratlog_connector.exe，一键静默安装 GSI 配置。
                    </p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h3 className="font-bold mb-1 text-sm">2. 手机扫码</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        数据将通过加密通道实时推送到你的手机，无需在游戏内切屏。
                    </p>
                </div>
            </div>
        </div>
    );
}
