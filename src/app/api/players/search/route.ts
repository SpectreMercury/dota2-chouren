import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Player } from '@/config/players';

// 获取玩家数据文件路径
const getPlayersFilePath = () => {
  return path.join(process.cwd(), 'data', 'players.json');
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');

    if (!steamId) {
      return NextResponse.json(
        { error: 'Steam ID 是必需的' },
        { status: 400 }
      );
    }

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

    // 查找玩家
    const player = players.find(p => p.steamId === steamId);
    
    if (!player) {
      return NextResponse.json(
        { error: '未找到该 Steam ID 对应的玩家' },
        { status: 404 }
      );
    }

    return NextResponse.json(player);

  } catch (error) {
    console.error('搜索玩家失败:', error);
    return NextResponse.json(
      { error: '搜索玩家失败' },
      { status: 500 }
    );
  }
}