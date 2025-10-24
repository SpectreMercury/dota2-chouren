'use client';

import { useRef, useState } from 'react';
import { Player } from '@/config/players';

interface NavbarProps {
  onUserBind: (player: Player) => void;
  onUserUnbind: () => void;
  onEditProfile: () => void;
  userPlayer: Player | null;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

export default function Navbar({ onUserBind, onUserUnbind, onEditProfile, userPlayer, toast }: NavbarProps) {
  const [steamId, setSteamId] = useState('');
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const hideTimer = useRef<number | null>(null);

  const openMenu = () => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowUserMenu(true);
  };

  const scheduleCloseMenu = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setShowUserMenu(false);
      hideTimer.current = null;
    }, 180); // 小延迟避免从触发区移动到子菜单时闪烁
  };

  const handleBind = async () => {
    if (!steamId.trim()) {
      toast.warning('请输入Steam ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/players/search?steamId=${steamId}`);
      if (response.ok) {
        const player = await response.json();
        onUserBind(player);
        setIsBindModalOpen(false);
        setSteamId('');
      } else {
        toast.error('未找到玩家', '请检查Steam ID是否正确');
      }
    } catch (error) {
      console.error('绑定失败:', error);
      toast.error('绑定失败', '请稍后重试');
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* 导航栏 */}
      <nav 
        className="fixed top-0 w-full h-[90px]  z-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/nav.png')" }}
      >
        <div className="container mx-auto px-[60px] w-full h-full flex ">
          <div className="flex justify-end w-full items-start">
            {/* <video
                className=""
                src="/img/coverlogo180517.webm"
                autoPlay
                muted
                loop
                width={156}
                height={78}
                playsInline
                preload="metadata"
                aria-label="DOTA 2 仇人杯"
              /> */}
            <div className="flex gap-4 mt-2">
              {userPlayer ? (
                <div 
                  className="relative"
                  onMouseEnter={openMenu}
                  onMouseLeave={scheduleCloseMenu}
                >
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-900/50 transition-colors cursor-pointer">
                    <img
                      src={userPlayer.avatar}
                      alt={userPlayer.name}
                      className="w-8 h-8 rounded-full border border-red-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                    <span className="text-white text-sm font-medium">{userPlayer.name}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* 下拉菜单 */}
                  {showUserMenu && (
                    <div 
                      className="absolute top-full right-0 mt-1 w-48 bg-black/90 backdrop-blur-md border border-red-800/50 rounded-lg shadow-xl z-50"
                      onMouseEnter={openMenu}
                      onMouseLeave={scheduleCloseMenu}
                    >
                      <button
                        onClick={() => {
                          onEditProfile();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-red-900/50 transition-colors flex items-center gap-2 rounded-t-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        编辑信息
                      </button>
                      <button
                        onClick={() => {
                          onUserUnbind();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/50 transition-colors flex items-center gap-2 rounded-b-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                        解绑账号
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsBindModalOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                  绑定个人信息
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 顶部占位，避免内容被导航栏遮挡 */}
      <div className="h-[90px]"></div>

      {/* 绑定模态框 */}
      {isBindModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">绑定个人信息</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steam ID
                </label>
                <input
                  type="text"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  placeholder="输入你的 Steam ID"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBind();
                    }
                  }}
                />
                <p className="text-sm text-gray-400 mt-1">
                  输入你的Steam ID来绑定个人信息
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsBindModalOpen(false);
                  setSteamId('');
                }}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBind}
                disabled={isLoading || !steamId.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '绑定中...' : '绑定'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast容器 - 将会在主页面中统一显示 */}
    </>
  );
}
