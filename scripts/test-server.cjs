require('tsx/cjs');
const { startServer, serveStatic } = require('../server/api');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

async function main() {
    const { port } = await startServer(3456);
    serveStatic(outDir);
    console.log(`Production server running on http://127.0.0.1:${port}`);
    console.log(`Dashboard: http://127.0.0.1:${port}/dashboard?s=test`);
}

main();
