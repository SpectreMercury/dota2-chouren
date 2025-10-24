export interface Player {
  id: number;
  name: string;
  avatar: string;
  mmr: number;
  position: ("Carry" | "Mid" | "Offlane" | "Support" | "Gank")[];
  mainHeroes: string[];
  matches: number;
  win: number;
  lose: number;
  steamId: string;
  // 新增字段：根据战绩数据计算的统计信息
  avgKDA?: number;  // 平均KDA = (击杀 + 助攻) / 死亡
  avgGPM?: number;  // 平均每分钟金钱
  avgXPM?: number;  // 平均每分钟经验
  totalMatches?: number; // 实际参与的比赛场次
}

// 从 Dota 2 英雄池中随机选择的英雄
const heroPool = [
  "幻影刺客", "敌法师", "祈求者", "影魔", "痛苦女王", "斧王", "军团指挥官", 
  "水晶室女", "戴泽", "拉比克", "谜团", "发条技师", "树精卫士", "幽鬼", 
  "变体精灵", "混沌骑士", "莉娜", "风行者", "天怒法师", "半人马战行者", 
  "潮汐猎人", "暗影萨满", "巫妖", "死亡先知", "龙骑士", "维萨吉", "冥界亚龙",
  "美杜莎", "娜迦海妖", "虚空假面", "斯拉克", "血魔", "宙斯", "风暴之灵",
  "虚无之灵", "兽王", "钢背兽", "巨魔战将", "齐天大圣", "帕克", "黑暗贤者"
];

// 随机选择英雄的辅助函数
function getRandomHeroes(count: number): string[] {
  const shuffled = [...heroPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 战绩统计数据 - 使用steamId作为键，确保改名时数据不丢失
// GPM和XPM已经是每场平均值，不需要再除以场次
const playerStats = {
  "332495668": { kills: 66, deaths: 84, assists: 134, avgGPM: 424, avgXPM: 646, matches: 8 }, // Timekeeper
  "184907225": { kills: 46, deaths: 92, assists: 126, avgGPM: 366, avgXPM: 519, matches: 8 }, // QP
  "137233563": { kills: 50, deaths: 73, assists: 174, avgGPM: 426, avgXPM: 627, matches: 8 }, // RuKia
  "158454623": { kills: 72, deaths: 49, assists: 94, avgGPM: 653, avgXPM: 853, matches: 8 }, // W.W
  "178710885": { kills: 100, deaths: 48, assists: 113, avgGPM: 634, avgXPM: 971, matches: 8 }, // KAKAROT
  "138546577": { kills: 37, deaths: 30, assists: 52, avgGPM: 488, avgXPM: 712, matches: 4 }, // 为什么赢不了?
  "339891374": { kills: 15, deaths: 9, assists: 47, avgGPM: 572, avgXPM: 773, matches: 2 }, // YY
  "142213220": { kills: 89, deaths: 48, assists: 122, avgGPM: 717, avgXPM: 966, matches: 7 }, // 李星风剑心站在
  "322620051": { kills: 51, deaths: 26, assists: 78, avgGPM: 482, avgXPM: 724, matches: 4 }, // 九龙有悔
  "111": { kills: 59, deaths: 30, assists: 119, avgGPM: 581, avgXPM: 837, matches: 7 } // 修读书
};

// 计算平均值的辅助函数 - 使用steamId查找统计数据
function calculateAvgStats(steamId: string) {
  const stats = playerStats[steamId as keyof typeof playerStats];
  if (!stats) {
    return { avgKDA: undefined, avgGPM: undefined, avgXPM: undefined, totalMatches: 0 };
  }
  
  const avgKDA = stats.deaths > 0 
    ? parseFloat(((stats.kills + stats.assists) / stats.deaths).toFixed(2))
    : stats.kills + stats.assists; // 如果死亡为0，KDA = K+A
  
  return {
    avgKDA,
    avgGPM: stats.avgGPM,
    avgXPM: stats.avgXPM,
    totalMatches: stats.matches
  };
}

export const playersConfig: Player[] = [
  {
    id: 1,
    name: "Timekeeper",
    avatar: "/img/1.jpg",
    mmr: 7200,
    win: 2,
    lose: 6, 
    position: ["Carry"],
    mainHeroes: getRandomHeroes(3),
    matches: 8,
    steamId: "332495668",
    ...calculateAvgStats("332495668")
    // avgKDA: 2.38, avgGPM: 424, avgXPM: 646
  },
  {
    id: 2,
    name: "QP",
    avatar: "/img/2.jpg", 
    mmr: 6800,
    position: ["Mid"],
    win: 0,
    lose: 8, 
    mainHeroes: getRandomHeroes(3),
    matches: 8,
    steamId: "184907225",
    ...calculateAvgStats("184907225")
    // avgKDA: 1.87, avgGPM: 366, avgXPM: 519
  },
  {
    id: 3,
    name: "RuKia",
    avatar: "/img/3.jpg",
    mmr: 6500,
    position: ["Offlane"],
    win: 8,
    lose: 0, 
    mainHeroes: getRandomHeroes(3),
    matches: 8,
    steamId: "137233563",
    ...calculateAvgStats("137233563")
    // avgKDA: 3.07, avgGPM: 426, avgXPM: 627
  },
  {
    id: 4,
    name: "W.W",
    avatar: "/img/4.jpg",
    mmr: 6200,
    position: ["Support"],
    win: 1,
    lose: 7, 
    mainHeroes: getRandomHeroes(3),
    matches: 8,
    steamId: "158454623",
    ...calculateAvgStats("158454623")
    // avgKDA: 3.39, avgGPM: 653, avgXPM: 853
  },
  {
    id: 5,
    name: "KAKAROT",
    avatar: "/img/5.jpg",
    mmr: 6900,
    position: ["Support"],
    win: 6,
    lose: 2, 
    mainHeroes: getRandomHeroes(3),
    matches: 8,
    steamId: "178710885",
    ...calculateAvgStats("178710885")
    // avgKDA: 4.44, avgGPM: 634, avgXPM: 971
  },
  {
    id: 6,
    name: "为什么赢不了?",
    avatar: "/img/6.jpg",
    mmr: 7100,
    position: ["Carry"], 
    win: 0,
    lose: 4, 
    mainHeroes: getRandomHeroes(3),
    matches: 4,
    steamId: "138546577",
    ...calculateAvgStats("138546577")
    // avgKDA: 2.97, avgGPM: 488, avgXPM: 712
  },
  {
    id: 7,
    name: "YY",
    avatar: "/img/7.jpg",
    mmr: 6600,
    position: ["Mid"],
    win: 2,
    lose: 0, 
    mainHeroes: getRandomHeroes(3),
    matches: 2,
    steamId: "339891374",
    ...calculateAvgStats("339891374")
    // avgKDA: 6.89, avgGPM: 572, avgXPM: 773
  },
  {
    id: 8,
    name: "李星风剑心站在",
    avatar: "/img/8.jpg",
    mmr: 7050,
    position: ["Offlane"],
    win: 6,
    lose: 1, 
    mainHeroes: getRandomHeroes(3),
    matches: 7,
    steamId: "142213220",
    ...calculateAvgStats("142213220")
    // avgKDA: 4.40, avgGPM: 717, avgXPM: 966
  },
  {
    id: 9,
    name: "九龙有悔",
    avatar: "/img/9.jpg",
    mmr: 6750,
    position: ["Support"],
    win: 2,
    lose: 2, 
    mainHeroes: getRandomHeroes(3),
    matches: 4,
    steamId: "322620051",
    ...calculateAvgStats("322620051")
    // avgKDA: 4.96, avgGPM: 482, avgXPM: 724
  },
  {
    id: 12,
    name: "林港",
    avatar: "/img/12.jpg",
    mmr: 7300,
    position: ["Mid"],
    win: 0,
    lose: 0, 
    mainHeroes: getRandomHeroes(3),
    matches: 0,
    steamId: "244198204",
    ...calculateAvgStats("244198204")
    // 无数据
  },
  {
    id: 11,
    name: "修读书",
    avatar: "/img/11.jpg",
    mmr: 7300,
    position: ["Mid"],
    win: 2,
    lose: 5, 
    mainHeroes: getRandomHeroes(3),
    matches: 7,
    steamId: "111",
    ...calculateAvgStats("111")
    // avgKDA: 5.93, avgGPM: 581, avgXPM: 837
  }
];

/* 
✅ 修正后的数据统计说明:
- avgKDA: 平均KDA = (总击杀 + 总助攻) / 总死亡
- avgGPM: 平均每分钟金钱收入（已修正为实际平均值）
- avgXPM: 平均每分钟经验获取（已修正为实际平均值）
- totalMatches: 实际参加的比赛场次

各选手数据概览（已修正）:
📊 最高数据榜:
- 最高KDA: YY (6.89) - 但仅2场数据
- 第二KDA: 修读书 (5.93) - 7场数据，稳定
- 第三KDA: 九龙有悔 (4.96) - 4场数据
- 第四KDA: KAKAROT (4.44) - 8场数据，非常稳定
- 最高GPM: 李星风剑心站在 (717)
- 最高XPM: KAKAROT (971)

⚠️ 需要提升的选手:
- QP: KDA 1.87 (46K/92D/126A) - 死亡过多
- 为什么赢不了?: 0胜4负，需要改进

🏆 综合表现最佳:
- KAKAROT: 6胜2负, KDA 4.44, GPM 634, XPM 971
- 李星风剑心站在: 6胜1负, KDA 4.40, GPM 717
- 修读书: KDA 5.93, 全方位数据优秀
*/