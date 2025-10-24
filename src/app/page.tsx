'use client';

import { useState, useEffect } from 'react';
import PlayerCard from '@/components/PlayerCard';
import PlayerCardSkeleton from '@/components/PlayerCardSkeleton';
import MatchHeroSkeleton from '@/components/MatchHeroSkeleton';
import Navbar from '@/components/Navbar';
import ProfileModal from '@/components/ProfileModal';
import MatchHero from '@/components/MatchHero';
import { ToastContainer, useToast } from '@/components/Toast';
import { Player } from '@/config/players';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlayer, setUserPlayer] = useState<Player | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [matchesRefreshKey, setMatchesRefreshKey] = useState(0);
  const toast = useToast();

  // 加载玩家数据
  const loadPlayers = async () => {
    try {
      const response = await fetch('/api/players', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      } else {
        console.error('Failed to load players');
      }
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      // 立即结束loading，避免阻塞其他组件（如对阵）
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
    // 从 localStorage 加载绑定的用户信息
    const savedUser = localStorage.getItem('dota2-bound-user');
    if (savedUser) {
      try {
        const player = JSON.parse(savedUser);
        setUserPlayer(player);
      } catch (error) {
        console.error('加载用户信息失败:', error);
        localStorage.removeItem('dota2-bound-user');
      }
    }
  }, []);

  const handlePlayerUpdate = (updatedPlayer: any) => {
    setPlayers(prev => 
      prev.map(player => 
        player.steamId === updatedPlayer.steamId ? updatedPlayer : player
      )
    );
    // 更新用户Profile
    if (userPlayer && userPlayer.steamId === updatedPlayer.steamId) {
      setUserPlayer(updatedPlayer);
    }
    // 重新加载数据确保同步
    loadPlayers();
    // 触发对阵区域重新加载，确保显示最新职位/名字
    setMatchesRefreshKey((k) => k + 1);
  };

  const handleUserBind = (player: Player) => {
    setUserPlayer(player);
    // 保存到 localStorage
    localStorage.setItem('dota2-bound-user', JSON.stringify(player));
    toast.success('绑定成功', `已绑定 ${player.name} 的信息`);
  };

  const handleUserUnbind = () => {
    setUserPlayer(null);
    localStorage.removeItem('dota2-bound-user');
    toast.info('已解绑', '用户信息已清除');
  };

  const handleProfileClick = () => {
    // 先打开编辑框，内部自行拉取最新数据并显示骨架屏
    setIsProfileModalOpen(true);
  };

  return (
    <div className="min-h-screen relative">
      {/* 菜单栏 */}
      <Navbar 
        onUserBind={handleUserBind} 
        onUserUnbind={handleUserUnbind}
        userPlayer={userPlayer}
        onEditProfile={handleProfileClick}
        toast={toast} 
      />
      
      {/* 首屏英雄区域 */}
      {/* 让对阵组件独立加载，避免等待玩家列表完成 */}
      <MatchHero key={matchesRefreshKey} />
      
      <main>
        <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            参赛选手
          </h2>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            查看所有选手的详细信息和战绩数据
          </p>
        </header>

        {isLoading ? (
          <div className="relative overflow-hidden py-4">
            <div className="flex gap-8">
              {/* 骨架屏卡片 */}
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="flex-shrink-0 w-80">
                  <PlayerCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden py-4">
            <div className="flex gap-8 animate-scroll">
              {/* 第一组卡片 */}
              {players.map((player) => (
                <div key={player.id} className="flex-shrink-0 w-80">
                  <PlayerCard player={player} />
                </div>
              ))}
              {/* 第二组卡片 - 实现无缝循环 */}
              {players.map((player) => (
                <div key={`duplicate-${player.id}`} className="flex-shrink-0 w-80">
                  <PlayerCard player={player} />
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="text-center mt-16 text-gray-400">
          <p>&copy; 2025 Dota 2 仇人杯. Ready for battle!</p>
        </footer>
        </div>
      </main>

      {/* Profile放大模态框 */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        player={userPlayer}
        onSave={handlePlayerUpdate}
        toast={toast}
      />

      {/* Toast容器 */}
      <ToastContainer messages={toast.messages} onRemove={toast.removeToast} />
    </div>
  );
}
