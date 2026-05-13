import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

// CS2 可能的安装文件夹名（按优先级排列）
export const CS2_FOLDER_NAMES = ['Counter-Strike 2', 'Counter-Strike Global Offensive'];
export const CS2_CFG_SUBPATH = 'game/csgo/cfg';

export interface DiagnosticEntry {
    step: string;
    path: string;
    success: boolean;
    error?: string;
}

export interface PathDetectionResult {
    cfgDir: string | null;
    diagnostics: DiagnosticEntry[];
}

// Windows 注册表查询 Steam 路径
function findSteamPathFromRegistry(): { path: string | null; diagnostics: DiagnosticEntry[] } {
    const diagnostics: DiagnosticEntry[] = [];

    // HKCU\Software\Valve\Steam\SteamPath
    try {
        const result = execSync(
            'reg query "HKCU\\Software\\Valve\\Steam" /v "SteamPath"',
            { encoding: 'utf-8', timeout: 5000 }
        );
        const match = result.match(/SteamPath\s+REG_SZ\s+(.+)/);
        if (match) {
            const steamPath = match[1].trim().replace(/\//g, '\\');
            diagnostics.push({
                step: 'Registry (HKCU)',
                path: steamPath,
                success: true,
            });
            return { path: steamPath, diagnostics };
        }
    } catch (err) {
        diagnostics.push({
            step: 'Registry (HKCU)',
            path: 'HKCU\\Software\\Valve\\Steam',
            success: false,
            error: String(err),
        });
    }

    // HKLM 候选路径
    const candidates = [
        'C:\\Program Files (x86)\\Steam',
        'C:\\Program Files\\Steam',
        process.env['PROGRAMFILES(X86)'] + '\\Steam',
        process.env['PROGRAMFILES'] + '\\Steam',
    ].filter(Boolean) as string[];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            diagnostics.push({ step: 'Fallback path', path: p, success: true });
            return { path: p, diagnostics };
        }
        diagnostics.push({ step: 'Fallback path', path: p, success: false, error: 'Not found' });
    }

    return { path: null, diagnostics };
}

// 解析 libraryfolders.json 获取所有 Steam 库路径
function getSteamLibraries(steamPath: string): { paths: string[]; diagnostics: DiagnosticEntry[] } {
    const diagnostics: DiagnosticEntry[] = [];
    const libraries = [steamPath];

    const foldersJson = path.join(steamPath, 'steamapps', 'libraryfolders.json');
    try {
        if (!fs.existsSync(foldersJson)) {
            diagnostics.push({
                step: 'libraryfolders.json',
                path: foldersJson,
                success: false,
                error: 'File not found',
            });
            return { paths: libraries, diagnostics };
        }

        const data = JSON.parse(fs.readFileSync(foldersJson, 'utf-8'));
        for (const key of Object.keys(data)) {
            const lib = data[key];
            if (lib.path) {
                const libPath = process.platform === 'win32'
                    ? lib.path.replace(/\//g, '\\')
                    : lib.path;
                if (!libraries.includes(libPath)) {
                    libraries.push(libPath);
                    diagnostics.push({
                        step: 'Steam library',
                        path: libPath,
                        success: true,
                    });
                }
            }
        }
    } catch (err) {
        diagnostics.push({
            step: 'libraryfolders.json',
            path: foldersJson,
            success: false,
            error: String(err),
        });
    }

    return { paths: libraries, diagnostics };
}

// 在所有 Steam 库中查找 CS2 cfg 目录
export function findCS2CfgDir(): PathDetectionResult {
    const allDiagnostics: DiagnosticEntry[] = [];
    console.log('[SteamPaths] 开始查找 CS2 cfg 目录...');

    const { path: steamPath, diagnostics: steamDiag } = findSteamPathFromRegistry();
    allDiagnostics.push(...steamDiag);

    // 打印注册表检测结果
    for (const d of steamDiag) {
        console.log(`[SteamPaths]   ${d.success ? '✓' : '✗'} ${d.step}: ${d.path}${d.error ? ' (' + d.error + ')' : ''}`);
    }

    if (!steamPath) {
        console.error('[SteamPaths] ✗ 未找到 Steam 安装路径');
        allDiagnostics.push({
            step: 'Result',
            path: '',
            success: false,
            error: 'Steam installation not found',
        });
        return { cfgDir: null, diagnostics: allDiagnostics };
    }
    console.log(`[SteamPaths] ✓ Steam 路径: ${steamPath}`);

    const { paths: libraries, diagnostics: libDiag } = getSteamLibraries(steamPath);
    allDiagnostics.push(...libDiag);

    // 打印库扫描结果
    for (const d of libDiag) {
        console.log(`[SteamPaths]   ${d.success ? '✓' : '✗'} ${d.step}: ${d.path}${d.error ? ' (' + d.error + ')' : ''}`);
    }
    console.log(`[SteamPaths] 共发现 ${libraries.length} 个 Steam 库: ${libraries.join(', ')}`);

    // 遍历所有库查找 CS2
    for (const lib of libraries) {
        for (const folderName of CS2_FOLDER_NAMES) {
            const cfgDir = path.join(lib, 'steamapps', 'common', folderName, CS2_CFG_SUBPATH);
            console.log(`[SteamPaths]   检查: ${cfgDir}`);
            if (fs.existsSync(cfgDir)) {
                console.log(`[SteamPaths] ✓ 找到 CS2 cfg 目录: ${cfgDir}`);
                allDiagnostics.push({
                    step: 'CS2 cfg found',
                    path: cfgDir,
                    success: true,
                });
                return { cfgDir, diagnostics: allDiagnostics };
            }
            allDiagnostics.push({
                step: 'CS2 cfg check',
                path: cfgDir,
                success: false,
                error: 'Directory not found',
            });
        }
    }

    console.error('[SteamPaths] ✗ 所有 Steam 库中均未找到 CS2 安装');
    allDiagnostics.push({
        step: 'Result',
        path: '',
        success: false,
        error: 'CS2 installation not found in any Steam library',
    });
    return { cfgDir: null, diagnostics: allDiagnostics };
}
