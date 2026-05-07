import { app, BrowserWindow, shell, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { startServer, serveStatic } from '../server/api';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let serverClose: (() => void) | null = null;

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

// 检测 CS2 安装路径并写入 GSI 配置
function configureCS2GSI(port: number) {
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

    const possiblePaths: string[] = [];

    if (process.platform === 'win32') {
        const steamPaths = [
            'C:\\Program Files (x86)\\Steam',
            'C:\\Program Files\\Steam',
            process.env['PROGRAMFILES(X86)'] + '\\Steam',
            process.env['PROGRAMFILES'] + '\\Steam',
        ];
        for (const sp of steamPaths) {
            possiblePaths.push(
                path.join(sp, 'steamapps', 'common', 'Counter-Strike Global Offensive', 'game', 'csgo', 'cfg')
            );
        }
    } else if (process.platform === 'darwin') {
        possiblePaths.push(
            path.join(process.env.HOME || '', 'Library', 'Application Support', 'Steam', 'steamapps', 'common', 'Counter-Strike Global Offensive', 'game', 'csgo', 'cfg')
        );
    } else {
        possiblePaths.push(
            path.join(process.env.HOME || '', '.steam', 'steam', 'steamapps', 'common', 'Counter-Strike Global Offensive', 'game', 'csgo', 'cfg')
        );
    }

    for (const cfgDir of possiblePaths) {
        if (fs.existsSync(cfgDir)) {
            const cfgFile = path.join(cfgDir, 'gamestate_integration_stratlog.cfg');
            try {
                fs.writeFileSync(cfgFile, cfgContent, 'utf-8');
                console.log(`[GSI] Config written to: ${cfgFile}`);
                return true;
            } catch (err) {
                console.error(`[GSI] Failed to write config:`, err);
            }
        }
    }

    console.log('[GSI] CS2 cfg directory not found. User may need to configure manually.');
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

    // 设置窗口层级最高（游戏之上）
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    overlayWindow.setVisibleOnAllWorkspaces(true);

    // 加载 overlay 页面
    overlayWindow.loadURL(`http://127.0.0.1:${port}/overlay.html`);

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}

async function createWindow() {
    const isDev = !app.isPackaged;

    // 启动 API 服务器（局域网可访问）
    const { port, close } = await startServer(0, true);
    serverClose = close;

    // 服务静态文件（__dirname 始终是 dist-electron/electron/，上两级到项目根）
    const outDir = path.resolve(path.join(__dirname, '..', '..', 'out'));
    serveStatic(outDir);

    // 尝试自动配置 CS2 GSI
    configureCS2GSI(port);

    // 获取局域网 IP
    const localIP = getLocalIP();
    const mobileUrl = `http://${localIP}:${port}/dashboard?s=default`;

    // 创建主窗口
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

    mainWindow.loadURL(`http://127.0.0.1:${port}/dashboard?s=default`);

    // 用默认浏览器打开外部链接
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 创建悬浮窗
    createOverlay(port);

    // 输出信息
    console.log('=================================');
    console.log('  CS2 Coach 已启动');
    console.log('=================================');
    console.log(`  本地地址: http://127.0.0.1:${port}`);
    console.log(`  手机访问: ${mobileUrl}`);
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
