import Pusher from 'pusher';
import PushNotifications from '@pusher/push-notifications-server';

// 初始化 Pusher（环境变量缺失时降级为 null）
export const pusher =
    process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.PUSHER_SECRET
        ? new Pusher({
              appId: process.env.PUSHER_APP_ID,
              key: process.env.NEXT_PUBLIC_PUSHER_KEY,
              secret: process.env.PUSHER_SECRET,
              cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap3',
              useTLS: true,
          })
        : null;

// 初始化 Pusher Beams (推送到手机通知栏)
export const beamsClient =
    process.env.PUSHER_BEAMS_INSTANCE_ID && process.env.PUSHER_BEAMS_SECRET_KEY
        ? new PushNotifications({
              instanceId: process.env.PUSHER_BEAMS_INSTANCE_ID,
              secretKey: process.env.PUSHER_BEAMS_SECRET_KEY,
          })
        : null;

// 战术生成逻辑 (迁移自 tactic_generator.py)
export function getEconomyTier(avgMoney: number) {
    if (avgMoney < 2500) return "ECO";
    if (avgMoney < 3900) return "HALF_BUY";
    if (avgMoney < 4800) return "FORCE";
    return "FULL_BUY";
}

export function generateTactic(map: string, team: string, economy: string) {
    // 这里暂时使用精简版逻辑，后续可以把整个数据字典搬过来
    const mapKey = map.replace('de_', '').toUpperCase();
    return {
        title: `${economy} - ${team} 执行方案`,
        description: `针对 ${mapKey} 的实战建议...`,
        steps: [
            "1:50 占据关键位置",
            "1:40 投掷干扰道具",
            "1:30 开始包点爆破"
        ]
    };
}
