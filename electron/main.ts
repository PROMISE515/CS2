import { app, BrowserWindow, shell, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execSync } from 'child_process';
import { startServer, serveStatic } from '../server/api';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let serverClose: (() => void) | null = null;

const PORT = 3456;

// GSI 配置状态（通过 IPC 暴露给渲染进程）
interface SetupStatus {
    configWritten: boolean;
    cfgPath: string | null;
    cs2Running: boolean;
    port: number;
}
let setupStatus: SetupStatus = {
    configWritten: false,
    cfgPath: null,
    cs2Running: false,
    port: PORT,
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

// 检测 Steam 路径（Windows 注册表）
function findSteamPath(): string | null {
    if (process.platform !== 'win32') {
        const home = process.env.HOME || '';
        return process.platform === 'darwin'
            ? path.join(home, 'Library', 'Application Support', 'Steam')
            : path.join(home, '.steam', 'steam');
    }

    try {
        const result = execSync(
            'reg query "HKCU\\Software\\Valve\\Steam" /v "SteamPath"',
            { encoding: 'utf-8', timeout: 3000 }
        );
        const match = result.match(/SteamPath\s+REG_SZ\s+(.+)/);
        if (match) {
            return match[1].trim().replace(/\//g, '\\');
        }
    } catch {}

    const candidates = [
        'C:\\Program Files (x86)\\Steam',
        'C:\\Program Files\\Steam',
        process.env['PROGRAMFILES(X86)'] + '\\Steam',
        process.env['PROGRAMFILES'] + '\\Steam',
    ];
    for (const p of candidates) {
        if (p && fs.existsSync(p)) return p;
    }

    return null;
}

// 从 Steam libraryfolders.json 获取所有游戏库路径
function getSteamLibraries(steamPath: string): string[] {
    const libraries = [steamPath];

    try {
        const foldersJson = path.join(steamPath, 'steamapps', 'libraryfolders.json');
        const data = JSON.parse(fs.readFileSync(foldersJson, 'utf-8'));
        for (const key of Object.keys(data)) {
            const lib = data[key];
            if (lib.path) {
                const libPath = process.platform === 'win32'
                    ? lib.path.replace(/\//g, '\\')
                    : lib.path;
                if (!libraries.includes(libPath)) {
                    libraries.push(libPath);
                }
            }
        }
    } catch {}

    return libraries;
}

// 查找 CS2 cfg 目录
function findCS2CfgDir(): string | null {
    const steamPath = findSteamPath();
    if (!steamPath) {
        console.log('[GSI] Steam not found');
        return null;
    }

    const libraries = getSteamLibraries(steamPath);

    for (const lib of libraries) {
        const cfgDir = path.join(lib, 'steamapps', 'common', 'Counter-Strike Global Offensive', 'game', 'csgo', 'cfg');
        if (fs.existsSync(cfgDir)) {
            return cfgDir;
        }
        const cfgDir2 = path.join(lib, 'steamapps', 'common', 'Counter-Strike 2', 'game', 'csgo', 'cfg');
        if (fs.existsSync(cfgDir2)) {
            return cfgDir2;
        }
    }

    return null;
}

// 写入 GSI 配置（固定端口，每次启动都重写）
function configureCS2GSI(): boolean {
    const cfgContent = `"StratLog GSI v2.0"
{
    "uri"           "http://127.0.0.1:${PORT}/api/gsi"
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

    const cfgDir = findCS2CfgDir();
    if (cfgDir) {
        const cfgFile = path.join(cfgDir, 'gamestate_integration_stratlog.cfg');
        try {
            fs.writeFileSync(cfgFile, cfgContent, 'utf-8');
            console.log(`[GSI] Config written to: ${cfgFile}`);
            setupStatus.configWritten = true;
            setupStatus.cfgPath = cfgFile;
            return true;
        } catch (err) {
            console.error(`[GSI] Failed to write config:`, err);
            setupStatus.configWritten = false;
            return false;
        }
    }

    console.log('[GSI] CS2 not found.');
    setupStatus.configWritten = false;
    return false;
}

// 创建悬浮窗
function createOverlay() {
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
    overlayWindow.loadURL(`http://127.0.0.1:${PORT}/overlay.html`);

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}

async function createWindow() {
    // 1. 写入 GSI 配置（固定端口，每次启动都更新）
    configureCS2GSI();

    // 2. 检测 CS2 是否在运行
    setupStatus.cs2Running = isCS2Running();
    if (setupStatus.cs2Running) {
        console.log('[GSI] CS2 is already running — user needs to restart CS2');
    }

    // 3. 启动 API 服务器（固定端口，局域网可访问）
    try {
        const { close } = await startServer(PORT, true);
        serverClose = close;
    } catch (err) {
        console.error(`[Server] Failed to start on port ${PORT}:`, err);
        // 端口被占用时尝试杀掉占用进程（仅限自己的旧进程）
        console.error(`[Server] Port ${PORT} may be in use. Please close other instances.`);
    }

    // 4. 服务静态文件
    const outDir = path.resolve(path.join(__dirname, '..', '..', 'out'));
    serveStatic(outDir);

    // 5. 注册 IPC：渲染进程查询 setup 状态
    ipcMain.handle('get-setup-status', () => setupStatus);

    // 6. 创建主窗口
    const localIP = getLocalIP();
    const mobileUrl = `http://${localIP}:${PORT}/dashboard?s=default`;

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

    mainWindow.loadURL(`http://127.0.0.1:${PORT}/dashboard?s=default`);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 7. 创建悬浮窗
    createOverlay();

    // 8. 输出信息
    console.log('=================================');
    console.log('  CS2 Coach 已启动');
    console.log('=================================');
    console.log(`  端口: ${PORT}`);
    console.log(`  手机访问: ${mobileUrl}`);
    console.log(`  GSI 配置: ${setupStatus.configWritten ? '已写入' : '未找到 CS2'}`);
    console.log(`  CS2 运行中: ${setupStatus.cs2Running ? '是 (需重启)' : '否'}`);
    console.log('=================================');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (serverClose) serverClose();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
