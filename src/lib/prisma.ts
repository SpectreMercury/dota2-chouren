import { PrismaClient } from '@prisma/client';
import type { Player } from '@/config/players';
import fs from 'fs';
import path from 'path';
import { playersConfig } from '@/config/players';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 文件存储的回退方案
const getPlayersFilePath = () => {
  return path.join(process.cwd(), 'data', 'players.json');
};

// 带超时的数据库操作
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('操作超时')), timeoutMs);
  });
  return Promise.race([promise, timeout]);
}

// 混合存储：优先使用MongoDB，失败时使用文件
export class HybridStorage {
  static async getPlayers(): Promise<Player[]> {
    try {
      // 尝试从MongoDB获取数据
      const players = await withTimeout(
        prisma.player.findMany({
          orderBy: { playerId: 'asc' }
        }),
        5000
      );
      
      return players.map(this.transformDbPlayer);
    } catch (error: unknown) {
      console.log('MongoDB失败，使用文件存储:', error instanceof Error ? error.message : String(error));
      
      // 回退到文件存储
      const filePath = getPlayersFilePath();
      
      if (!fs.existsSync(filePath)) {
        // 如果文件不存在，创建初始数据
        const dataDir = path.dirname(filePath);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(playersConfig, null, 2), 'utf-8');
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent) as Player[];
    }
  }
  
  static async updatePlayer(steamId: string, updateData: any) {
    try {
      // 尝试更新MongoDB
      const player = await withTimeout(
        prisma.player.update({
          where: { steamId },
          data: {
            name: updateData.name,
            position: Array.isArray(updateData.position) ? updateData.position : [updateData.position],
            mainHeroes: updateData.mainHeroes
          }
        }),
        5000
      );
      
      return this.transformDbPlayer(player);
    } catch (error: unknown) {
      console.log('MongoDB更新失败，使用文件存储:', error instanceof Error ? error.message : String(error));
      
      // 回退到文件存储
      const filePath = getPlayersFilePath();
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const players = JSON.parse(fileContent);
      
      const playerIndex = players.findIndex((p: any) => p.steamId === steamId);
      if (playerIndex === -1) {
        throw new Error('未找到该玩家');
      }
      
      players[playerIndex] = {
        ...players[playerIndex],
        name: updateData.name,
        position: updateData.position,
        mainHeroes: updateData.mainHeroes
      };
      
      fs.writeFileSync(filePath, JSON.stringify(players, null, 2), 'utf-8');
      return players[playerIndex];
    }
  }
  
  static async findPlayer(steamId: string) {
    try {
      // 尝试从MongoDB查找
      const player = await withTimeout(
        prisma.player.findUnique({
          where: { steamId }
        }),
        5000
      );
      
      return player ? this.transformDbPlayer(player) : null;
    } catch (error: unknown) {
      console.log('MongoDB查找失败，使用文件存储:', error instanceof Error ? error.message : String(error));
      
      // 回退到文件存储
      const filePath = getPlayersFilePath();
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const players = JSON.parse(fileContent);
      
      return players.find((p: any) => p.steamId === steamId) || null;
    }
  }
  
  static transformDbPlayer(dbPlayer: any): Player {
    return {
      id: dbPlayer.playerId,
      name: dbPlayer.name,
      avatar: dbPlayer.avatar,
      mmr: dbPlayer.mmr,
      position: dbPlayer.position,
      mainHeroes: dbPlayer.mainHeroes,
      matches: dbPlayer.matches,
      win: dbPlayer.win,
      lose: dbPlayer.lose,
      steamId: dbPlayer.steamId,
      avgKDA: dbPlayer.avgKDA,
      avgGPM: dbPlayer.avgGPM,
      avgXPM: dbPlayer.avgXPM,
      totalMatches: dbPlayer.totalMatches,
    };
  }
}
