'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/config/players';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlayer: Partial<Player>) => void;
}

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
        return prev.filter(h => h !== hero);
      } else if (prev.length < 3) {
        return [...prev, hero];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    onSelect(selectedHeroes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-2xl font-bold text-white">选择常用英雄 ({selectedHeroes.length}/3)</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {allHeroes.map((hero) => (
              <div
                key={hero}
                onClick={() => toggleHero(hero)}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-2 transition-all
                  ${selectedHeroes.includes(hero) 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-slate-600 hover:border-slate-400'
                  }
                  ${selectedHeroes.length >= 3 && !selectedHeroes.includes(hero) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
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
                  <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{selectedHeroes.indexOf(hero) + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedHeroes.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}

// 主编辑弹窗
export default function EditPlayerModal({ isOpen, onClose, onSave }: EditPlayerModalProps) {
  const [steamId, setSteamId] = useState('');
  const [player, setPlayer] = useState<Player | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    position: ['Carry'] as Player['position'],
    mainHeroes: [] as string[]
  });
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchPlayer = async () => {
    if (!steamId.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/players/search?steamId=${steamId}`);
      if (response.ok) {
        const foundPlayer = await response.json();
        setPlayer(foundPlayer);
        setEditForm({
          name: foundPlayer.name,
          position: Array.isArray(foundPlayer.position) ? foundPlayer.position : [foundPlayer.position],
          mainHeroes: foundPlayer.mainHeroes
        });
      } else {
        alert('未找到该 Steam ID 对应的玩家');
        setPlayer(null);
      }
    } catch (error) {
      console.error('搜索玩家失败:', error);
      alert('搜索失败，请稍后重试');
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!player) return;

    setIsLoading(true);
    try {
      const updatedPlayer = {
        ...player,
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
        onSave(updatedPlayer);
        alert('保存成功！');
        onClose();
      } else {
        alert('保存失败，请稍后重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请稍后重试');
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setSteamId('');
    setPlayer(null);
    setEditForm({ name: '', position: ['Carry'], mainHeroes: [] });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
        <div className="bg-slate-800 rounded-2xl max-w-md w-full">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">编辑玩家信息</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Steam ID 搜索 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Steam ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  placeholder="输入 Steam ID"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={searchPlayer}
                  disabled={isLoading || !steamId.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '搜索中...' : '搜索'}
                </button>
              </div>
            </div>

            {/* 编辑表单 */}
            {player && (
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    玩家名称
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    位置（最多选择2个）
                  </label>
                  <div className="space-y-2">
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
                          className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                          disabled={!editForm.position.includes(pos as any) && editForm.position.length >= 2}
                        />
                        <span className="text-sm text-gray-300">{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    常用英雄 ({editForm.mainHeroes.length}/3)
                  </label>
                  <button
                    onClick={() => setIsHeroModalOpen(true)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-gray-400 hover:border-slate-500 transition-colors"
                  >
                    {editForm.mainHeroes.length > 0 
                      ? editForm.mainHeroes.join(', ') 
                      : '点击选择英雄...'
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
            >
              取消
            </button>
            {player && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '保存中...' : '保存'}
              </button>
            )}
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