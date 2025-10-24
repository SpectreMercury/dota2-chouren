'use client';

import { Player } from '@/config/players';

interface PlayerCardProps {
  player: Player;
}

const getPositionColor = (positions: string[] | string) => {
  const position = Array.isArray(positions) ? positions[0] : positions; // 使用第一个位置的颜色
  switch (position) {
    case 'Carry': return 'bg-red-500';
    case 'Mid': return 'bg-yellow-500';
    case 'Offlane': return 'bg-green-500';
    case 'Support': return 'bg-blue-500';
    case 'Gank': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-red-900/30 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/20 aspect-[3/4]">
      <div className="text-center mb-4">
        <div className="w-20 h-20 rounded-full mx-auto mb-3 shadow-lg overflow-hidden border-2 border-red-800/50">
          <img 
            src={player.avatar} 
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLDivElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{display: 'none'}}>
            {player.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{player.name}</h3>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className={`inline-block w-3 h-3 rounded-full ${getPositionColor(player.position)}`}></span>
          <span className="text-gray-300 text-sm"> {Array.isArray(player.position) ? player.position.join('/') : player.position}</span>
        </div>
        
        {/* 常用英雄 */}
        <div className="flex justify-center gap-2 mb-4">
          {player.mainHeroes.map((hero, index) => (
            <div 
              key={index}
              className="flex items-center justify-center"
              title={hero}
            >
              <img 
                src={`/dota2/${hero}.png`}
                alt={hero}
                className="h-10 w-auto object-contain rounded-md border border-red-800/50"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-xs text-gray-400 text-center px-1 py-1 bg-black/30 rounded-md border border-red-800/50">${hero.slice(0,2)}</span>`;
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-red-900/30">
          <span className="text-gray-400 text-sm">胜率</span>
          <span className={`font-bold ${
            player.win + player.lose === 0 ? 'text-gray-400' :
            ((player.win / (player.win + player.lose)) * 100) >= 70 ? 'text-green-400' : 
            ((player.win / (player.win + player.lose)) * 100) >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {player.win + player.lose === 0 ? 'N/A' : `${Math.round((player.win / (player.win + player.lose)) * 100)}%`}
          </span>
          <span className="text-gray-300 text-sm">{player.win}W-{player.lose}L</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-red-900/30">
          <span className="text-gray-400 text-sm">KDA</span>
          <span className={`font-bold ${(player.avgKDA ?? 0) >= 3 ? 'text-green-400' : (player.avgKDA ?? 0) >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
            {player.avgKDA ? player.avgKDA.toFixed(2) : 'N/A'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-red-900/30">
          <span className="text-gray-400 text-sm">GPM</span>
          <span className="text-blue-400 font-bold">{player.avgGPM || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-red-900/30">
          <span className="text-gray-400 text-sm">XPM</span>
          <span className="text-purple-400 font-bold">{player.avgXPM || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-400 text-sm">场次</span>
          <span className="text-gray-300 font-bold">{player.win + player.lose}</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="w-full bg-red-950/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                player.win + player.lose === 0 ? 'bg-gray-400' :
                ((player.win / (player.win + player.lose)) * 100) >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
                ((player.win / (player.win + player.lose)) * 100) >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ 
                width: player.win + player.lose === 0 ? '0%' : `${Math.round((player.win / (player.win + player.lose)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}