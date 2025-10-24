'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/config/players';

interface HeroSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (heroes: string[]) => void;
  currentHeroes: string[];
}

// 英雄选择弹窗
function HeroSelectModal({ isOpen, onClose, onSelect, currentHeroes }: HeroSelectModalProps) {
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>(currentHeroes);
  const [allHeroes, setAllHeroes] = useState<string[]>([]);

  useEffect(() => {
    // 从文件名获取所有英雄列表
    const loadHeroes = async () => {
      try {
        const response = await fetch('/api/heroes');
        const heroes = await response.json();
        setAllHeroes(heroes);
      } catch (error) {
        console.error('加载英雄列表失败:', error);
        // 使用备用英雄列表
        setAllHeroes([
          "幻影刺客", "敌法师", "祈求者", "影魔", "痛苦女王", "斧王", "军团指挥官", 
          "水晶室女", "戴泽", "拉比克", "谜团", "发条技师", "树精卫士", "幽鬼", 
          "变体精灵", "混沌骑士", "莉娜", "风行者", "天怒法师", "半人马战行者", 
          "潮汐猎人", "暗影萨满", "巫妖", "死亡先知", "龙骑士", "维萨吉", "冥界亚龙"
        ]);
      }
    };
    if (isOpen) {
      loadHeroes();
    }
  }, [isOpen]);

  const toggleHero = (hero: string) => {
    setSelectedHeroes(prev => {
      if (prev.includes(hero)) {
        // 如果已选中，则移除
        return prev.filter(h => h !== hero);
      } else if (prev.length < 3) {
        // 如果少于3个，直接添加
        return [...prev, hero];
      } else {
        // 如果已经有3个英雄，移除第一个，添加新的到末尾（FIFO队列）
        return [...prev.slice(1), hero];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(selectedHeroes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-black via-red-950/40 to-black rounded-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto border border-red-800/50 backdrop-blur-md">
        <div className="p-6 border-b border-red-800/30 bg-gradient-to-r from-red-900/20 to-transparent">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">选择常用英雄 ({selectedHeroes.length}/3)</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {allHeroes.map((hero) => (
              <div
                key={hero}
                onClick={() => toggleHero(hero)}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 group hover:scale-105
                  ${selectedHeroes.includes(hero) 
                    ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/25' 
                    : 'border-red-800/30 hover:border-red-600 bg-black/20 hover:bg-red-950/30'
                  }
                `}
                title={hero}
              >
                <img 
                  src={`/dota2/${hero}.png`}
                  alt={hero}
                  className="w-full aspect-square object-contain rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pgo8L3N2Zz4K';
                  }}
                />
                <p className="text-xs text-center text-gray-300 mt-1 truncate">{hero}</p>
                {selectedHeroes.includes(hero) && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border border-red-400 shadow-lg">
                    <span className="text-white text-xs font-bold drop-shadow">{selectedHeroes.indexOf(hero) + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-red-800/30 bg-gradient-to-r from-red-900/10 to-transparent flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all duration-200 border border-gray-500/50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedHeroes.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg border border-red-500/50"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSave: (updatedPlayer: Player) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

export default function ProfileModal({ isOpen, onClose, player, onSave, toast }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    position: ['Carry'] as Player['position'],
    mainHeroes: [] as string[]
  });
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayPlayer, setDisplayPlayer] = useState<Player | null>(player);

  useEffect(() => {
    setDisplayPlayer(player);
    if (player) {
      setEditForm({
        name: player.name,
        position: Array.isArray(player.position) ? player.position : [player.position],
        mainHeroes: player.mainHeroes
      });
    }
  }, [player]);

  // 打开时拉取最新玩家数据，期间显示骨架屏
  useEffect(() => {
    const refresh = async () => {
      if (!isOpen || !player?.steamId) return;
      setIsRefreshing(true);
      try {
        const res = await fetch(`/api/players/search?steamId=${player.steamId}`, { cache: 'no-store' });
        if (res.ok) {
          const fresh = await res.json();
          setDisplayPlayer(fresh);
          setEditForm({
            name: fresh.name,
            position: Array.isArray(fresh.position) ? fresh.position : [fresh.position],
            mainHeroes: fresh.mainHeroes
          });
        }
      } catch (e) {
        console.warn('刷新玩家信息失败:', e);
      }
      setIsRefreshing(false);
    };
    refresh();
  }, [isOpen, player?.steamId]);

  const handleSave = async () => {
    const current = displayPlayer || player;
    if (!current) return;

    setIsLoading(true);
    try {
      const updatedPlayer = {
        ...current,
        ...editForm
      };
      
      const response = await fetch('/api/players/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPlayer)
      });

      if (response.ok) {
        const result = await response.json();
        // 使用服务端返回的最新数据，避免本地与数据库不一致
        onSave(result.player ?? updatedPlayer);
        setIsEditing(false);
        toast.success('保存成功', '信息已更新');
      } else {
        toast.error('保存失败', '请稍后重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败', '请稍后重试');
    }
    setIsLoading(false);
  };

  if (!isOpen || !(displayPlayer || player)) return null;

  const current = displayPlayer || player!;
  const winRate = current.matches > 0 ? ((current.win / current.matches) * 100).toFixed(1) : '0.0';

  return (
    <>
      {/* 蒙层 */}
      <div 
        className="fixed inset-0 z-50"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.90), rgba(0,0,0,0.90)), url('/img/profile')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: 'blur(2px)'
        }}
        onClick={onClose}
      ></div>

      {/* 放大的卡片 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-gradient-to-br from-black via-red-950/40 to-black rounded-xl max-w-md w-full shadow-2xl border border-red-800/50 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 卡片头部 */}
          <div className="relative p-6 border-b border-red-800/30 bg-gradient-to-r from-red-900/20 to-transparent">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-900/50 hover:bg-red-800 flex items-center justify-center text-red-300 hover:text-white transition-all duration-200 text-sm border border-red-700/50"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 p-1">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pgo8L3N2Zz4K';
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                {isRefreshing ? (
                  <div className="h-8 bg-red-900/30 rounded w-40 animate-pulse" />
                ) : isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold text-white bg-black/40 border border-red-700/50 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-red-500 focus:bg-black/60 backdrop-blur-sm"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">{current.name}</h2>
                )}
                {isRefreshing ? (
                  <div className="mt-2 h-4 bg-red-900/30 rounded w-48 animate-pulse" />
                ) : isEditing ? (
                  <div className="mt-2 space-y-2">
                    {['Carry', 'Mid', 'Offlane', 'Support', 'Gank'].map((pos) => (
                      <label key={pos} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.position.includes(pos as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (editForm.position.length < 2) {
                                setEditForm(prev => ({ 
                                  ...prev, 
                                  position: [...prev.position, pos] as Player['position']
                                }));
                              }
                            } else {
                              setEditForm(prev => ({ 
                                ...prev, 
                                position: prev.position.filter(p => p !== pos) as Player['position']
                              }));
                            }
                          }}
                          className="w-4 h-4 text-red-500 bg-black/40 border-red-700/50 rounded focus:ring-red-500 focus:ring-2"
                          disabled={!editForm.position.includes(pos as any) && editForm.position.length >= 2}
                        />
                        <span className="text-sm text-red-300">{pos}</span>
                      </label>
                    ))}
                    <p className="text-xs text-gray-400 mt-1">最多选择2个位置</p>
                  </div>
                ) : (
                  <p className="text-base text-red-300 drop-shadow">
                    {Array.isArray(current.position) ? current.position.join('/') : current.position}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 卡片内容 */}
          <div className="p-6">
            {/* 统计数据 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-black/30 rounded-lg p-3 border border-red-800/30">
                <div className="text-xl font-bold text-yellow-400 drop-shadow">{isRefreshing ? <span className="inline-block h-5 w-12 bg-red-900/30 rounded animate-pulse" /> : current.mmr}</div>
                <div className="text-xs text-gray-300">MMR</div>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-3 border border-red-800/30">
                <div className="text-xl font-bold text-green-400 drop-shadow">{isRefreshing ? <span className="inline-block h-5 w-10 bg-red-900/30 rounded animate-pulse" /> : `${winRate}%`}</div>
                <div className="text-xs text-gray-300">胜率</div>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-3 border border-red-800/30">
                <div className="text-xl font-bold text-blue-400 drop-shadow">{isRefreshing ? <span className="inline-block h-5 w-12 bg-red-900/30 rounded animate-pulse" /> : (current.avgKDA || '0.00')}</div>
                <div className="text-xs text-gray-300">KDA</div>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-3 border border-red-800/30">
                <div className="text-xl font-bold text-purple-400 drop-shadow">{isRefreshing ? <span className="inline-block h-5 w-8 bg-red-900/30 rounded animate-pulse" /> : current.matches}</div>
                <div className="text-xs text-gray-300">场次</div>
              </div>
            </div>

            {/* 战绩 */}
            <div className="mb-6 bg-black/20 rounded-lg p-4 border border-red-800/30">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-300">战绩</span>
                <span className="text-white font-semibold">{current.win}胜 {current.lose}负</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3 border border-red-800/20">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
            </div>

            {/* 擅长英雄 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300 text-sm font-medium">擅长英雄 ({(isEditing ? editForm.mainHeroes : player.mainHeroes).length}/3)</span>
                {isEditing && (
                  <button
                    onClick={() => setIsHeroModalOpen(true)}
                    className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-lg border border-red-500/50"
                  >
                    选择英雄
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(isEditing ? editForm.mainHeroes : current.mainHeroes).map((hero, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={`/dota2/${hero}.png`}
                      alt={hero}
                      className="w-full aspect-square object-contain rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
                      title={hero}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                    <p className="text-center text-xs text-gray-300 mt-2 font-medium truncate">{hero}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: current.name,
                        position: current.position,
                        mainHeroes: current.mainHeroes
                      });
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition-all duration-200 border border-gray-500/50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg border border-green-500/50"
                  >
                    {isLoading ? '保存中...' : '保存'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-lg border border-red-500/50"
                >
                  编辑信息
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 英雄选择弹窗 */}
      <HeroSelectModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        onSelect={(heroes) => setEditForm(prev => ({ ...prev, mainHeroes: heroes }))}
        currentHeroes={editForm.mainHeroes}
      />
    </>
  );
}
