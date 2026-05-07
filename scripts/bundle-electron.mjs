import { build } from 'esbuild';

// 打包 server/api.ts（包含 express）
await build({
    entryPoints: ['server/api.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: 'dist-electron/server/api.js',
    external: [],
});

// 打包 electron/main.ts（排除 electron 模块，它是运行时）
await build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: 'dist-electron/electron/main.js',
    external: ['electron'],
});

console.log('Bundle complete!');
