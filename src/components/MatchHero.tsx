
'use client';

import { useState, useEffect } from 'react';
import { type Match } from '@/config/matches';
import MatchHeroSkeleton from '@/components/MatchHeroSkeleton';

export default function MatchHero() {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    // 加载对阵数据（直接从数据库合并后返回）
    const loadMatch = async () => {
      try {
        const res = await fetch('/api/matches', { cache: 'no-store' });
        if (res.ok) {
          const matches = await res.json();
          setMatch(matches[0]);
        }
      } catch (error) {
        console.error('加载对阵数据失败:', error);
      }
    };

    loadMatch();
  }, []);

  // 加载中：显示骨架屏，避免先渲染“已结束”占位
  if (!match) {
    return <MatchHeroSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0"></div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* 顶部LOGO视频（替换原文字） */}
        <div className="mb-6 flex justify-center">
          
        </div>
        
        {/* Slogan 图拼接（放大并通过负边距消除中间留白） */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-0 leading-none">
            <img src="/img/slogan1.png" alt="slogan-1" className="h-24 md:h-28 lg:h-32 object-contain select-none" draggable="false" />
            <img src="/img/slogan2.png" alt="slogan-2" className="h-24 md:h-28 lg:h-32 object-contain select-none -ml-3 md:-ml-5 lg:-ml-8" draggable="false" />
          </div>
        </div>

        {/* 对阵信息 */}
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-red-800/50">
          <div className="text-xl text-gray-300 mb-6">本周对阵</div>
          
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* 腾哥队 */}
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-white mb-4" style={{ color: match?.teamA.color }}>
                {match?.teamA.name}
              </div>
              <div className="space-y-2">
                {match?.teamA.players.map((player, index) => (
                  <div key={player.steamId} className="flex items-center justify-start space-x-3">
                    <img 
                      src={player.avatar} 
                      alt={player.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-300 text-sm">{player.name}</span>
                    <span className="text-xs text-gray-500">({Array.isArray(player.position) ? player.position.join('/') : player.position})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="mx-8">
              <div className="text-4xl font-bold text-red-500">VS</div>
              <div className="text-sm text-gray-400 mt-2">{match?.date}</div>
              <div className="text-sm text-gray-400">{match?.time}</div>
            </div>

            {/* 芬儿队 */}
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-white mb-4" style={{ color: match?.teamB.color }}>
                {match?.teamB.name}
              </div>
              <div className="space-y-2">
                {match?.teamB.players.map((player, index) => (
                  <div key={player.steamId} className="flex items-center justify-end space-x-3">
                    <span className="text-xs text-gray-500">({Array.isArray(player.position) ? player.position.join('/') : player.position})</span>
                    <span className="text-gray-300 text-sm">{player.name}</span>
                    <img 
                      src={player.avatar} 
                      alt={player.name}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 比赛状态 */}
          <div className="mt-8 text-center">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              match?.status === 'upcoming' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
              match?.status === 'live' ? 'bg-red-900/50 text-red-300 border border-red-700' :
              'bg-gray-900/50 text-gray-300 border border-gray-700'
            }`}>
              {match.status === 'upcoming' ? '即将开始' :
               match.status === 'live' ? '正在进行' : '已结束'}
            </span>
          </div>
        </div>

        {/* 向下滚动提示 */}
        <div className="mt-16 text-gray-400 text-sm">
          <div className="animate-bounce">↓</div>
          <div className="mt-2">查看选手详情</div>
        </div>
      </div>
    </div>
  );
}
