import { NextResponse } from 'next/server';
import { HybridStorage } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { currentWeekMatches } from '@/config/matches';

export async function GET() {
  try {
    const steamIds = Array.from(
      new Set(
        currentWeekMatches.flatMap(m => [
          ...m.teamA.players.map(p => p.steamId),
          ...m.teamB.players.map(p => p.steamId),
        ])
      )
    );

    // 使用与 /api/players 相同的数据源（DB 优先，失败回退到文件），避免新旧源不一致
    const sourcePlayers = await HybridStorage.getPlayers();
    const bySteam = new Map(sourcePlayers.map(p => [p.steamId, p] as const));

    const merged = currentWeekMatches.map(match => ({
      ...match,
      teamA: {
        ...match.teamA,
        players: match.teamA.players.map(p => {
          const live = bySteam.get(p.steamId);
          return live
            ? {
                ...p,
                id: live.id,
                name: live.name,
                avatar: live.avatar,
                position: live.position,
              }
            : p;
        }),
      },
      teamB: {
        ...match.teamB,
        players: match.teamB.players.map(p => {
          const live = bySteam.get(p.steamId);
          return live
            ? {
                ...p,
                id: live.id,
                name: live.name,
                avatar: live.avatar,
                position: live.position,
              }
            : p;
        }),
      },
    }));

    return NextResponse.json(merged);
  } catch (error: any) {
    console.error('获取对阵数据失败，回退到静态配置:', error?.message || error);
    // 回退：返回静态配置（不含数据库覆盖）以避免前端空白
    return NextResponse.json(currentWeekMatches);
  }
}
