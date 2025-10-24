import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import os from 'os';

// Also load .env.local so local overrides take effect (dotenv doesn't by default)
function loadFile(fp: string) {
  try {
    if (!fs.existsSync(fp)) return;
    const content = fs.readFileSync(fp, 'utf-8');
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // .env.local should override .env
      process.env[key] = val;
    }
  } catch (e) {
    console.warn('[MIGRATE] 读取 env 失败:', (e as any)?.message || e);
  }
}
loadFile(path.join(process.cwd(), '.env'));
loadFile(path.join(process.cwd(), '.env.local'));
// 兼容自定义环境变量名：优先使用 MONGODB_URI，不存在则使用 dota2_MONGODB_URI/DOTA2_MONGODB_URI
const altMongo = (process.env as any).dota2_MONGODB_URI || process.env.dota2_MONGODB_URI;
if (!process.env.MONGODB_URI && altMongo) {
  process.env.MONGODB_URI = altMongo as string;
}
// 如果没有路径且提供了数据库名，则自动补全
try {
  const dbNameFromEnv = process.env.MONGODB_DATABASE || process.env.MONGODB_DB || process.env.DB_NAME;
  if (process.env.MONGODB_URI && dbNameFromEnv) {
    const u = new URL(process.env.MONGODB_URI);
    if (!u.pathname || u.pathname === '/') {
      u.pathname = `/${dbNameFromEnv}`;
      process.env.MONGODB_URI = u.toString();
    }
  }
} catch {}

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
    const mask = (s?: string) => {
      if (!s) return '(未设置)';
      try { const u = new URL(s); if (u.username) u.username = '***'; if (u.password) u.password = '***'; return u.toString(); } catch { return '(invalid URI)'; }
    };
    console.log('MONGODB_URI(脱敏):', mask(process.env.MONGODB_URI));
    console.log('DNS servers:', dns.getServers());

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
