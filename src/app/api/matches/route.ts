import { NextResponse } from 'next/server';
import { HybridStorage } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { currentWeekMatches } from '@/config/matches';

export async function GET() {
  const steamIds = Array.from(
    new Set(
      currentWeekMatches.flatMap(m => [
        ...m.teamA.players.map(p => p.steamId),
        ...m.teamB.players.map(p => p.steamId),
      ])
    )
  );

  // 强制从 DB 读取玩家信息，失败则返回 500
  try {
    const sourcePlayers = await HybridStorage.getPlayers();
    const bySteam = new Map(sourcePlayers.map(p => [p.steamId, p] as const));

    const merged = currentWeekMatches.map(match => ({
      ...match,
      teamA: {
        ...match.teamA,
        players: match.teamA.players.map(p => {
          const live = bySteam.get(p.steamId);
          return live
            ? { ...p, id: live.id, name: live.name, avatar: live.avatar, position: live.position }
            : p;
        }),
      },
      teamB: {
        ...match.teamB,
        players: match.teamB.players.map(p => {
          const live = bySteam.get(p.steamId);
          return live
            ? { ...p, id: live.id, name: live.name, avatar: live.avatar, position: live.position }
            : p;
        }),
      },
    }));

    return NextResponse.json(merged);
  } catch (error: any) {
    console.error('获取对阵数据失败（DB 读取失败）:', error?.message || error);
    const payload: any = { error: '获取对阵数据失败' };
    if (process.env.DB_DIAG === '1') payload.details = error?.message || String(error);
    return NextResponse.json(payload, { status: 500 });
  }
}
