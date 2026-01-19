import { NextResponse } from 'next/server';
import { pusher, beamsClient, getEconomyTier, generateTactic } from '@/lib/stratlog';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, gsiData } = body;

        if (!sessionId || !gsiData) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        // 解析 GSI 数据
        const map = gsiData.map?.name || 'de_mirage';
        const team = gsiData.player?.team || 'T';
        const playerMoney = gsiData.player?.state?.money || 0;

        // 计算战术
        const ecoTier = getEconomyTier(playerMoney);
        const tactic = generateTactic(map, team, ecoTier);

        const state = {
            map,
            team,
            economy: ecoTier,
            round: gsiData.map?.round || 0,
            phase: gsiData.phase_countdowns?.phase || 'live',
            tactic
        };

        // 通过 Pusher 推送给该 session 的网页
        await pusher.trigger(`session-${sessionId}`, 'state-update', state);

        // 如果是新回合开始 (freezetime)，通过 Pusher Beams 发送手机通知
        if (state.phase === 'freezetime' && beamsClient) {
            try {
                await beamsClient.publishToInterests([`user-${sessionId}`], {
                    web: {
                        notification: {
                            title: `StratLog: ${state.map} 第 ${state.round} 回合`,
                            body: `战术已更新：${state.tactic.title}`,
                            deep_link: `https://stratlog-cs2.vercel.app/dashboard?s=${sessionId}`,
                        },
                    },
                });
            } catch (err) {
                console.error('Beams Error:', err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('GSI Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
