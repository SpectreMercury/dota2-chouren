import { NextRequest, NextResponse } from 'next/server';
import { HybridStorage } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const updatedPlayer = await request.json();

    if (!updatedPlayer.steamId) {
      return NextResponse.json(
        { error: 'Steam ID 是必需的' },
        { status: 400 }
      );
    }

    // 更新玩家数据
    const player = await HybridStorage.updatePlayer(updatedPlayer.steamId, updatedPlayer);

    return NextResponse.json({ 
      success: true, 
      message: '玩家信息更新成功',
      player
    });

  } catch (error: unknown) {
    console.error('更新玩家信息失败:', error);
    return NextResponse.json(
      { 
        error: '更新玩家信息失败', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
