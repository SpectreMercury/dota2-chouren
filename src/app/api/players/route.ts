import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Player, playersConfig } from '@/config/players';

// 获取玩家数据文件路径
const getPlayersFilePath = () => {
  return path.join(process.cwd(), 'data', 'players.json');
};

export async function GET() {
  try {
    const filePath = getPlayersFilePath();
    
    // 如果文件不存在，从配置创建初始数据
    if (!fs.existsSync(filePath)) {
      // 确保目录存在
      const dataDir = path.dirname(filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // 创建初始数据文件
      fs.writeFileSync(filePath, JSON.stringify(playersConfig, null, 2), 'utf-8');
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const players: Player[] = JSON.parse(fileContent);

    return NextResponse.json(players);

  } catch (error) {
    console.error('获取玩家数据失败:', error);
    return NextResponse.json(
      { error: '获取玩家数据失败' },
      { status: 500 }
    );
  }
}