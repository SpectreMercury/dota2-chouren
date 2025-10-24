export interface MatchPlayer {
  id: number;
  name: string;
  avatar: string;
  position: ("Carry" | "Mid" | "Offlane" | "Support" | "Gank")[];
  steamId: string;
}

export interface Team {
  name: string;
  logo?: string;
  color: string; // 队伍主色调
  players: MatchPlayer[];
}

export interface Match {
  id: number;
  title: string;
  date: string;
  time: string;
  status: "upcoming" | "live" | "finished";
  teamA: Team;
  teamB: Team;
  result?: {
    scoreA: number;
    scoreB: number;
  };
}

// 本周对阵配置 - 请在这里填入5v5选手信息
export const currentWeekMatches: Match[] = [
  {
    id: 1,
    title: "仇人杯 - 第三轮",
    date: "2025-10-28",
    time: "20:00",
    status: "upcoming",
    teamA: {
      name: "腾哥队",
      color: "#10B981", // 绿色
      players: [
        {
          id: 4,
          name: "W.W",
          avatar: "/img/4.jpg",
          position: ["Support"],
          steamId: "158454623"
        },
        {
          id: 1,
          name: "Timekeeper",
          avatar: "/img/1.jpg",
          position: ["Carry"],
          steamId: "332495668"
        },
        {
          id: 7,
          name: "YY",
          avatar: "/img/7.jpg",
          position: ["Mid"],
          steamId: "339891374"
        },
        {
          id: 12,
          name: "林港",
          avatar: "/img/12.jpg",
          position: ["Mid"],
          steamId: "244198204"
        },
        {
          id: 6,
          name: "为什么赢不了?",
          avatar: "/img/6.jpg",
          position: ["Carry"],
          steamId: "138546577"
        }
      ]
    },
    teamB: {
      name: "芬儿队", 
      color: "#EF4444", // 红色
      players: [
        {
          id: 8,
          name: "李星风剑心站在",
          avatar: "/img/8.jpg",
          position: ["Offlane"],
          steamId: "142213220"
        },
        {
          id: 3,
          name: "RuKia",
          avatar: "/img/3.jpg",
          position: ["Offlane"],
          steamId: "137233563"
        },
        {
          id: 11,
          name: "修读书",
          avatar: "/img/11.jpg",
          position: ["Mid"],
          steamId: "111"
        },
        {
          id: 5,
          name: "KAKAROT",
          avatar: "/img/5.jpg",
          position: ["Support"],
          steamId: "178710885"
        },
        {
          id: 9,
          name: "九龙有悔",
          avatar: "/img/9.jpg",
          position: ["Support"],
          steamId: "322620051"
        }
      ]
    }
  }
];

// Slogan配置
export const slogans = [
  "仇人相见，分外眼红", 
];

// 随机获取slogan
export function getRandomSlogan(): string {
  return slogans[Math.floor(Math.random() * slogans.length)];
}