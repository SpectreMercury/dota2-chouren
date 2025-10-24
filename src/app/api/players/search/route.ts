import { NextRequest, NextResponse } from 'next/server';
import { HybridStorage } from '@/lib/prisma';

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

    // 查找玩家
    const player = await HybridStorage.findPlayer(steamId);
    
    if (!player) {
      return NextResponse.json(
        { error: '未找到该 Steam ID 对应的玩家' },
        { status: 404 }
      );
    }

    return NextResponse.json(player);

  } catch (error: unknown) {
    console.error('搜索玩家失败:', error);
    return NextResponse.json(
      { 
        error: '搜索玩家失败', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
