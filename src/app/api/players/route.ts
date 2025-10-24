import { NextResponse } from 'next/server';
import { HybridStorage } from '@/lib/prisma';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const players = await HybridStorage.getPlayers();
    return NextResponse.json(players);
  } catch (error: unknown) {
    const msg = (error as any)?.message || String(error);
    console.error('获取玩家数据失败:', msg);
    const payload: any = { error: '获取玩家数据失败' };
    if (process.env.DB_DIAG === '1') payload.details = msg;
    return NextResponse.json(payload, { status: 500 });
  }
}
