'use client';

import { useState, useEffect } from 'react';
import { currentWeekMatches, getRandomSlogan } from '@/config/matches';
import { Player } from '@/config/players';

export default function MatchHero() {
  const [slogan, setSlogan] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [match, setMatch] = useState(currentWeekMatches[0]);

  useEffect(() => {
    setSlogan(getRandomSlogan());
    
    // 加载最新的玩家数据
    const loadPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        if (response.ok) {
          const playersData = await response.json();
          setPlayers(playersData);
          
          // 更新对阵信息中的玩家数据
          const updatedMatch = {
            ...currentWeekMatches[0],
            teamA: {
              ...currentWeekMatches[0].teamA,
              players: currentWeekMatches[0].teamA.players.map(matchPlayer => {
                const latestPlayer = playersData.find((p: Player) => p.steamId === matchPlayer.steamId);
                return latestPlayer ? {
                  ...matchPlayer,
                  name: latestPlayer.name,
                  position: latestPlayer.position,
                  avatar: latestPlayer.avatar
                } : matchPlayer;
              })
            },
            teamB: {
              ...currentWeekMatches[0].teamB,
              players: currentWeekMatches[0].teamB.players.map(matchPlayer => {
                const latestPlayer = playersData.find((p: Player) => p.steamId === matchPlayer.steamId);
                return latestPlayer ? {
                  ...matchPlayer,
                  name: latestPlayer.name,
                  position: latestPlayer.position,
                  avatar: latestPlayer.avatar
                } : matchPlayer;
              })
            }
          };
          setMatch(updatedMatch);
        }
      } catch (error) {
        console.error('加载玩家数据失败:', error);
      }
    };
    
    loadPlayers();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-red-950 to-black flex flex-col items-center justify-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* 主标题 */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-wider">
          DOTA 2 仇人杯
        </h1>
        
        {/* Slogan */}
        <div className="text-2xl md:text-3xl text-red-400 font-medium mb-16 tracking-wide">
          {slogan}
        </div>

        {/* 对阵信息 */}
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-red-800/50">
          <div className="text-xl text-gray-300 mb-6">本周对阵</div>
          
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* 腾哥队 */}
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-white mb-4" style={{ color: match.teamA.color }}>
                {match.teamA.name}
              </div>
              <div className="space-y-2">
                {match.teamA.players.map((player, index) => (
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
              <div className="text-sm text-gray-400 mt-2">{match.date}</div>
              <div className="text-sm text-gray-400">{match.time}</div>
            </div>

            {/* 芬儿队 */}
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-white mb-4" style={{ color: match.teamB.color }}>
                {match.teamB.name}
              </div>
              <div className="space-y-2">
                {match.teamB.players.map((player, index) => (
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
              match.status === 'upcoming' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
              match.status === 'live' ? 'bg-red-900/50 text-red-300 border border-red-700' :
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