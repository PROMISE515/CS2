import { app, BrowserWindow, shell, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execSync } from 'child_process';
import { startServer, serveStatic } from '../server/api';
import { findCS2CfgDir, type DiagnosticEntry } from '../lib/steam-paths';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let serverClose: (() => void) | null = null;

const PORT = 3456;

// GSI 配置状态（通过 IPC 暴露给渲染进程）
interface SetupStatus {
    configWritten: boolean;
    cfgPath: string | null;
    cs2Running: boolean;
    cs2RestartRequired: boolean;
    port: number;
    serverError: string | null;
    diagnostics: DiagnosticEntry[];
}
let setupStatus: SetupStatus = {
    configWritten: false,
    cfgPath: null,
    cs2Running: false,
    cs2RestartRequired: false,
    port: PORT,
    serverError: null,
    diagnostics: [],
};

// 获取局域网 IP
function getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

// 检测 CS2 是否在运行
function isCS2Running(): boolean {
    try {
        if (process.platform === 'win32') {
            const result = execSync('tasklist /FI "IMAGENAME eq cs2.exe" /NH', {
                encoding: 'utf-8',
                timeout: 3000,
            });
            return result.includes('cs2.exe');
        } else if (process.platform === 'darwin') {
            const result = execSync('pgrep -f "cs2" || true', {
                encoding: 'utf-8',
                timeout: 3000,
            });
            return result.trim().length > 0;
        } else {
            const result = execSync('pgrep -f "cs2" || true', {
                encoding: 'utf-8',
                timeout: 3000,
            });
            return result.trim().length > 0;
        }
    } catch {
        return false;
    }
}

// 写入 GSI 配置（每次启动都重写，使用实际端口）
function configureCS2GSI(port: number): boolean {
    console.log(`[GSI] 目标端口: ${port}`);
    console.log(`[GSI] GSI URI: http://127.0.0.1:${port}/api/gsi`);

    const cfgContent = `"StratLog GSI v2.0"
{
    "uri"           "http://127.0.0.1:${port}/api/gsi"
    "timeout"       "5.0"
    "buffer"        "0.1"
    "throttle"      "0.5"
    "heartbeat"     "30.0"
    "data"
    {
        "map"                   "1"
        "round"                 "1"
        "allplayers"            "1"
        "player_id"             "1"
        "player_state"          "1"
        "player_weapons"        "1"
        "player_match_stats"    "1"
        "phase_countdowns"      "1"
    }
    "auth"
    {
        "sessionId" "default"
    }
}`;

    const { cfgDir, diagnostics } = findCS2CfgDir();
    setupStatus.diagnostics = diagnostics;

    if (cfgDir) {
        const cfgFile = path.join(cfgDir, 'gamestate_integration_stratlog.cfg');
        try {
            fs.writeFileSync(cfgFile, cfgContent, 'utf-8');
            console.log(`[GSI] ✓ 配置文件写入成功: ${cfgFile}`);
            console.log(`[GSI]   文件大小: ${cfgContent.length} 字节`);
            console.log(`[GSI]   URI: http://127.0.0.1:${port}/api/gsi`);
            console.log(`[GSI]   Session: default`);
            setupStatus.configWritten = true;
            setupStatus.cfgPath = cfgFile;
            return true;
        } catch (err) {
            console.error(`[GSI] ✗ 配置文件写入失败: ${cfgFile}`);
            console.error(`[GSI]   错误: ${err}`);
            console.error(`[GSI]   可能原因: 权限不足或目录不存在`);
            setupStatus.configWritten = false;
            return false;
        }
    }

    console.error('[GSI] ✗ 未找到 CS2 安装目录，无法写入配置文件');
    console.error('[GSI]   已扫描所有 Steam 库，未找到 CS2 cfg 目录');
    setupStatus.configWritten = false;
    return false;
}

// 创建悬浮窗
function createOverlay(port: number) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    overlayWindow = new BrowserWindow({
        width: 260,
        height: 280,
        x: width - 280,
        y: height - 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
        focusable: false,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    overlayWindow.setVisibleOnAllWorkspaces(true);
    overlayWindow.loadURL(`http://127.0.0.1:${port}/overlay.html`);

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}

async function createWindow() {
    console.log('');
    console.log('=========================================');
    console.log('  CS2 Coach 启动中...');
    console.log('=========================================');
    console.log(`  平台: ${process.platform}`);
    console.log(`  架构: ${process.arch}`);
    console.log(`  时间: ${new Date().toISOString()}`);
    console.log('=========================================');

    // 1. 启动 API 服务器（端口回退：3456-3460）
    console.log('\n[启动] 步骤 1/5: 启动 API 服务器...');
    const PORT_CANDIDATES = [3456, 3457, 3458, 3459, 3460];
    let actualPort = PORT;

    for (const candidate of PORT_CANDIDATES) {
        try {
            console.log(`[启动]   尝试端口 ${candidate}...`);
            const { close, port } = await startServer(candidate, true);
            serverClose = close;
            actualPort = port;
            console.log(`[启动] ✓ 服务器启动成功，端口: ${actualPort}`);
            break;
        } catch (err) {
            console.warn(`[启动]   ✗ 端口 ${candidate} 被占用: ${err}`);
        }
    }

    if (!serverClose) {
        setupStatus.serverError = `所有端口 ${PORT_CANDIDATES.join(', ')} 均被占用，请关闭其他程序后重试`;
        console.error(`[启动] ✗ 所有端口均被占用: ${PORT_CANDIDATES.join(', ')}`);
    }

    setupStatus.port = actualPort;

    // 2. 写入 GSI 配置（使用实际端口）
    console.log('\n[启动] 步骤 2/5: 写入 GSI 配置...');
    configureCS2GSI(actualPort);

    // 3. 检测 CS2 是否在运行
    console.log('\n[启动] 步骤 3/5: 检测 CS2 运行状态...');
    setupStatus.cs2Running = isCS2Running();
    console.log(`[启动] CS2 运行中: ${setupStatus.cs2Running ? '是' : '否'}`);

    if (setupStatus.cs2Running) {
        setupStatus.cs2RestartRequired = true;
        console.warn('[启动] ⚠ CS2 正在运行，需要重启才能加载新的 GSI 配置');

        // 轮询检测 CS2 重启
        let cs2WasRunning = true;
        let restartDetected = false;
        const pollRestart = setInterval(() => {
            const running = isCS2Running();
            if (cs2WasRunning && !running) {
                restartDetected = true;
                console.log('[重启检测] CS2 已关闭，等待重新启动...');
            } else if (restartDetected && running) {
                setupStatus.cs2Running = true;
                setupStatus.cs2RestartRequired = false;
                clearInterval(pollRestart);
                console.log('[重启检测] ✓ CS2 已重新启动，GSI 连接应该已激活');
            }
            cs2WasRunning = running;
        }, 3000);
    }

    // 4. 服务静态文件
    console.log('\n[启动] 步骤 4/5: 加载静态文件...');
    const outDir = path.resolve(path.join(__dirname, '..', '..', 'out'));
    console.log(`[启动]   静态文件目录: ${outDir}`);
    console.log(`[启动]   目录存在: ${fs.existsSync(outDir) ? '是' : '否'}`);
    serveStatic(outDir);
    console.log('[启动] ✓ 静态文件服务已启动');

    // 5. 注册 IPC：渲染进程查询 setup 状态
    ipcMain.handle('get-setup-status', () => setupStatus);

    // 6. 创建主窗口
    console.log('\n[启动] 步骤 5/5: 创建窗口...');
    const localIP = getLocalIP();
    const mobileUrl = `http://${localIP}:${actualPort}/dashboard?s=default`;

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'CS2 Coach',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadURL(`http://127.0.0.1:${actualPort}/dashboard?s=default`);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 7. 创建悬浮窗
    createOverlay(actualPort);

    // 8. 输出最终状态
    console.log('');
    console.log('=========================================');
    console.log('  CS2 Coach 启动完成');
    console.log('=========================================');
    console.log(`  端口: ${actualPort}`);
    console.log(`  局域网 IP: ${localIP}`);
    console.log(`  手机访问: ${mobileUrl}`);
    console.log(`  GSI 配置: ${setupStatus.configWritten ? '✓ 已写入' : '✗ 未找到 CS2'}`);
    if (setupStatus.cfgPath) {
        console.log(`  配置路径: ${setupStatus.cfgPath}`);
    }
    console.log(`  CS2 运行中: ${setupStatus.cs2Running ? '是 (需重启)' : '否'}`);
    console.log(`  诊断条目: ${setupStatus.diagnostics.length} 条`);
    if (setupStatus.serverError) {
        console.error(`  服务器错误: ${setupStatus.serverError}`);
    }
    console.log('=========================================');
    console.log('');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (serverClose) serverClose();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
