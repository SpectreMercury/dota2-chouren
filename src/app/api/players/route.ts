import { NextResponse } from 'next/server';
import { HybridStorage } from '@/lib/prisma';

export async function GET() {
  try {
    const players = await HybridStorage.getPlayers();
    return NextResponse.json(players);
  } catch (error: unknown) {
    console.error('获取玩家数据失败:', error);
    return NextResponse.json({ error: '获取玩家数据失败' }, { status: 500 });
  }
}
