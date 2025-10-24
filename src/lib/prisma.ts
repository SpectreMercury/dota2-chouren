import { PrismaClient } from '@prisma/client';
import type { Player } from '@/config/players';
import fs from 'fs';
import path from 'path';
import { playersConfig } from '@/config/players';
import dns from 'dns';

// 兼容自定义环境变量名：优先使用 MONGODB_URI，不存在则使用 dota2_MONGODB_URI/DOTA2_MONGODB_URI
const altMongo = (process.env as any).dota2_MONGODB_URI || process.env.DOTA2_MONGODB_URI;
if (!process.env.MONGODB_URI && altMongo) {
  process.env.MONGODB_URI = altMongo as string;
}

// 如果 URI 缺少数据库名且提供了 MONGODB_DB/MONGODB_DATABASE/DB_NAME，则自动补全路径
try {
  const dbNameFromEnv = process.env.MONGODB_DB || process.env.MONGODB_DATABASE || process.env.DB_NAME;
  if (process.env.MONGODB_URI && dbNameFromEnv) {
    const u = new URL(process.env.MONGODB_URI);
    if (!u.pathname || u.pathname === '/') {
      u.pathname = `/${dbNameFromEnv}`;
      process.env.MONGODB_URI = u.toString();
    }
  }
} catch (_) {
  // 忽略解析失败
}

// 可配置的数据库操作超时时间，默认 30 秒
const DB_TIMEOUT_MS = parseInt(process.env.DB_TIMEOUT_MS || '30000', 10);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 诊断信息：仅当设置 DB_DIAG=1 时输出（不泄露敏感信息）
let diagLogged = false;
function logDbDiagnosticsOnce() {
  if (diagLogged || process.env.DB_DIAG !== '1') return;
  diagLogged = true;
  try {
    const used = process.env.MONGODB_URI ? 'MONGODB_URI' : (altMongo ? (process.env.DOTA2_MONGODB_URI ? 'DOTA2_MONGODB_URI' : 'dota2_MONGODB_URI') : 'NONE');
    const uri = process.env.MONGODB_URI || altMongo || '';
    if (!uri) {
      console.warn('[DB_DIAG] 未检测到连接串环境变量');
      return;
    }
    const u = new URL(uri);
    const hasDbName = Boolean(u.pathname && u.pathname !== '/' );
    const host = u.hostname;
    const isSrv = u.protocol === 'mongodb+srv:';
    console.log('[DB_DIAG] 使用的变量:', used);
    console.log('[DB_DIAG] 协议:', u.protocol, '主机:', host, '是否包含数据库名:', hasDbName);
    console.log('[DB_DIAG] 是否 SRV:', isSrv, 'DNS servers:', dns.getServers());
    if (isSrv) {
      const srvName = `_mongodb._tcp.${host}`;
      dns.resolveSrv(srvName, (err, addresses) => {
        if (err) {
          console.warn('[DB_DIAG] SRV 解析失败:', srvName, err.message);
        } else {
          console.log('[DB_DIAG] SRV 解析成功: 共', addresses.length, '条');
        }
      });
    }
  } catch (e: any) {
    console.warn('[DB_DIAG] 诊断异常:', e?.message || e);
  }
}
logDbDiagnosticsOnce();

// 文件存储的回退方案
const getPlayersFilePath = () => {
  return path.join(process.cwd(), 'data', 'players.json');
};

// 带超时的数据库操作
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = DB_TIMEOUT_MS): Promise<T> {
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
        DB_TIMEOUT_MS
      );
      
      return players.map(this.transformDbPlayer);
    } catch (error: unknown) {
      console.log('MongoDB失败，使用文件或内置数据:', error instanceof Error ? error.message : String(error));

      // 优先尝试读取已打包的只读文件；失败则返回内置配置
      try {
        const filePath = getPlayersFilePath();
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          return JSON.parse(fileContent) as Player[];
        }
      } catch (_) {
        // 忽略文件读取失败，继续返回内置配置
      }

      return playersConfig as Player[];
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
        DB_TIMEOUT_MS
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
        DB_TIMEOUT_MS
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
