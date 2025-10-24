import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface JSONPlayer {
  id: number;
  name: string;
  avatar: string;
  mmr: number;
  position: string[];
  mainHeroes: string[];
  matches: number;
  win: number;
  lose: number;
  steamId: string;
  avgKDA?: number;
  avgGPM?: number;
  avgXPM?: number;
  totalMatches?: number;
}

async function migrateData() {
  try {
    console.log('开始迁移数据到 MongoDB...');

    // 读取 JSON 文件
    const dataPath = path.join(process.cwd(), 'data', 'players.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('players.json 文件不存在');
      return;
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const players: JSONPlayer[] = JSON.parse(fileContent);

    console.log(`找到 ${players.length} 个玩家数据`);

    // 清空现有数据（可选）
    await prisma.player.deleteMany({});
    console.log('已清空现有数据');

    // 插入新数据
    for (const player of players) {
      await prisma.player.create({
        data: {
          playerId: player.id,
          name: player.name,
          avatar: player.avatar,
          mmr: player.mmr,
          position: player.position,
          mainHeroes: player.mainHeroes,
          matches: player.matches,
          win: player.win,
          lose: player.lose,
          steamId: player.steamId,
          avgKDA: player.avgKDA,
          avgGPM: player.avgGPM,
          avgXPM: player.avgXPM,
          totalMatches: player.totalMatches,
        },
      });
      console.log(`已插入玩家: ${player.name}`);
    }

    console.log('数据迁移完成！');
  } catch (error) {
    console.error('数据迁移失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
