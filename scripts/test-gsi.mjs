// 模拟 CS2 GSI 数据 — 测试 AI 教练功能
// 用法: node scripts/test-gsi.mjs

const API_URL = 'http://localhost:3000/api/gsi';
const SESSION = 'test_coach';

async function send(label, data) {
    console.log(`\n[发送] ${label}`);
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: SESSION, gsiData: data }),
        });
        const json = await res.json();
        console.log(`[响应] ${res.status}:`, JSON.stringify(json));
    } catch (err) {
        console.error(`[错误]`, err.message);
    }
}

console.log('=== CS2 AI 教练测试 ===');
console.log(`Dashboard: http://localhost:3000/dashboard?s=${SESSION}\n`);

// 模拟第5回合进行中（收集数据）
await send('第5回合对枪中', {
    map: { name: 'de_mirage', round: 5, phase: 'live',
        team_ct: { score: 2 }, team_t: { score: 2 } },
    player: { name: 'Nova_Star', team: 'T',
        state: { health: 80, money: 4200 },
        match_stats: { kills: 2, deaths: 1 } },
    phase_countdowns: { phase: 'live' },
    round: { bomb: null },
});

// 等一下
await new Promise(r => setTimeout(r, 2000));

// 第5回合结束，进入买枪期（触发 AI 分析）
await send('第5回合结束 → 买枪期 (触发AI分析)', {
    map: { name: 'de_mirage', round: 6, phase: 'freezetime',
        team_ct: { score: 2 }, team_t: { score: 3 } },
    player: { name: 'Nova_Star', team: 'T',
        state: { health: 0, money: 3400 },
        match_stats: { kills: 2, deaths: 2 } },
    phase_countdowns: { phase: 'freezetime' },
    round: { bomb: null },
});

// 等 AI 分析完成
console.log('\n等待 AI 分析 (约12秒)...');
await new Promise(r => setTimeout(r, 15000));

// 查看结果
try {
    const res = await fetch(`http://localhost:3000/api/state?s=${SESSION}`);
    const data = await res.json();
    const s = data.state;
    if (s?.aiAdvice) {
        console.log('\n=============================');
        console.log('       AI 战术建议');
        console.log('=============================');
        console.log(`局势: ${s.aiAdvice.situation}`);
        console.log(`指挥: ${s.aiAdvice.command}`);
        console.log(`买枪: ${s.aiAdvice.buyAdvice || '-'}`);
        console.log(`紧迫: ${s.aiAdvice.urgency}`);
        console.log('=============================');
    } else {
        console.log('暂无 AI 建议（可能还在分析中）');
    }
} catch {}

console.log(`\n打开查看: http://localhost:3000/dashboard?s=${SESSION}`);
