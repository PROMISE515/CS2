// CS2 地图知识库 — 供 AI 战术分析使用
// 每张地图的关键区域、常见战术、攻防要点

export interface MapKnowledge {
    name: string;
    callouts: string;       // 关键区域简称
    tStrategy: string;      // T方常见战术
    ctStrategy: string;     // CT方常见战术
    economy: string;        // 经济相关要点
}

export const MAP_KNOWLEDGE: Record<string, MapKnowledge> = {
    de_mirage: {
        name: 'Mirage (荒漠迷城)',
        callouts: 'A包点/A长廊/A Palace/A二楼/B包点/B短楼梯/B公寓/中路Mid/Window/Connector/Underpass/Jungle/CT出生点',
        tStrategy: 'A split(Palace+A长廊夹击), B rush(5人快攻B), Mid control(控制中路后转B或A), A fake B execute(假A真B)',
        ctStrategy: '2A1Mid2B默认, 前压Window拿信息, A长廊架狙, B短楼梯守包, 回防走Connector',
        economy: '中路控制权影响全图节奏，丢中路等于丢信息',
    },
    de_dust2: {
        name: 'Dust2 (炙热沙城2)',
        callouts: 'A大道/A小路/A包点/B洞/B门/B包点/中门/中路/CT出生点/T出生点/猪圈/蓝箱',
        tStrategy: 'A long rush, B rush through tunnels, Mid to B split, A short take, Default spread',
        ctStrategy: '2A1Mid2B, A大道架狙, 中门peek拿信息, B洞前压, 回防走CT',
        economy: '中门对狙是开局关键，赢中门=拿信息权',
    },
    de_inferno: {
        name: 'Inferno (炼狱小镇)',
        callouts: 'A包点/A二楼/阳台/书房/B包点/B香蕉道/B棺材/中路/侧道/CT出生点/教堂',
        tStrategy: 'Banana control(控制香蕉道后打B), A take(二楼+侧道夹击), Mid control, Fake A execute B',
        ctStrategy: '2A1Mid2B, 香蕉道molotov+smoke拖延, A二楼守包, 中路info, 回防走CT',
        economy: '香蕉道道具消耗大，需要预留烟雾弹和燃烧弹',
    },
    de_nuke: {
        name: 'Nuke (核子危机)',
        callouts: 'A包点/铁板/Ramp/仓库/外场/正门/B包点/B仓库/天桥/CT出生点/T出生点',
        tStrategy: 'Ramp control, Outside take(外场进正门), Secret to B(外场下B), A execute(正门+铁板)',
        ctStrategy: '3A2B铁板守, Ramp架狙, 外场拿信息, B仓库守包, 回防走正门',
        economy: '双层结构，垂直防守是关键，上下配合很重要',
    },
    de_overpass: {
        name: 'Overpass (死亡游乐园)',
        callouts: 'A包点/A长管/B包点/B工地/B桥/厕所/中路/水下/CT出生点/T出生点/柱子/绿通',
        tStrategy: 'B execute(工地+桥夹击), A long take(长管+厕所), Mid control, Connector push',
        ctStrategy: '2A1Mid2B, B工地前压拿信息, A长管架狙, 厕所守包, 回防走中路',
        economy: 'B点前压风险高回报高，适合经济劣势时搏一搏',
    },
    de_ancient: {
        name: 'Ancient (远古遗迹)',
        callouts: 'A包点/A长廊/A红房/B包点/B洞/B长廊/中路/Donut/CT出生点/T出生点/石柱',
        tStrategy: 'B洞control, A split(红房+长廊), Mid to A, Default spread',
        ctStrategy: '2A1Mid2B, B洞smoke拖延, A长廊架狙, 中路peek, 回防走CT',
        economy: '中路争夺激烈，道具消耗需要合理规划',
    },
    de_anubis: {
        name: 'Anubis (阿努比斯)',
        callouts: 'A包点/A长廊/A水道/B包点/B长廊/B中路/中路/水下/CT出生点/T出生点',
        tStrategy: 'Water control(水道控制), A execute(长廊+水道), B rush, Mid to B split',
        ctStrategy: '2A1Mid2B, 水道前压, A长廊架狙, B长廊守包, 回防走中路',
        economy: '水道控制是关键，丢水道等于丢地图控制权',
    },
    de_vertigo: {
        name: 'Vertigo (殒命大厦)',
        callouts: 'A包点/A楼梯/A长廊/B包点/B楼梯/B中路/中路/CT出生点/T出生点/电梯',
        tStrategy: 'A execute(楼梯+长廊), B rush, Mid control, Ramp push',
        ctStrategy: '2A1Mid2B, 楼梯架狙, A长廊守包, B楼梯前压, 回防走中路',
        economy: '双层结构类似Nuke，楼梯控制影响全图节奏',
    },
    de_train: {
        name: 'Train (列车停放站)',
        callouts: 'A包点/A大道/B包点/B长廊/外场/正门/绿通/CT出生点/T出生点/火车',
        tStrategy: 'Outside take(外场进正门), B execute(长廊+绿通), A long take, Popdog control',
        ctStrategy: '3A2B, 外场架狙, A大道守包, B长廊smoke, 回防走正门',
        economy: '外场对狙是关键，长距离交火需要AWP',
    },
    de_cache: {
        name: 'Cache (仓库)',
        callouts: 'A包点/A大道/A小路/B包点/B仓库/B中路/中路/白房/CT出生点/T出生点/卡车',
        tStrategy: 'Mid control(中路控制后转点), A take(大道+小路), B execute(仓库+中路), Default',
        ctStrategy: '2A1Mid2B, 中路peek, A大道架狙, B仓库守包, 回防走CT',
        economy: '中路是命脉，控制中路=两个包点都能打',
    },
};

export function getMapKnowledge(mapName: string): string {
    const key = mapName.toLowerCase().replace(/\s/g, '_');
    const map = MAP_KNOWLEDGE[key];
    if (!map) return `地图: ${mapName}`;

    return `地图: ${map.name}
关键区域: ${map.callouts}
T方战术: ${map.tStrategy}
CT方战术: ${map.ctStrategy}
经济要点: ${map.economy}`;
}
