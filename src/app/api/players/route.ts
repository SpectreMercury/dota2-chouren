import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Player } from '@/config/players';

// 获取玩家数据文件路径
const getPlayersFilePath = () => {
  return path.join(process.cwd(), 'data', 'players.json');
};

export async function GET() {
  try {
    const filePath = getPlayersFilePath();
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: '玩家数据文件不存在' },
        { status: 404 }
      );
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