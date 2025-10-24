export default function MatchHeroSkeleton() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br flex flex-col items-center justify-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0"></div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 animate-pulse">
        {/* 主标题 */}
        {/* Slogan 骨架 */}
        <div className="h-8 bg-gray-700/30 rounded-lg mb-16 w-64 mx-auto"></div>

        {/* 对阵信息骨架 */}
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-red-800/50">
          <div className="text-xl text-gray-300 mb-6">本周对阵</div>
          
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* 腾哥队骨架 */}
            <div className="text-center flex-1">
              <div className="h-8 bg-green-700/30 rounded-lg mb-4 w-32 mx-auto"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="flex items-center justify-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700/50"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-20"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="mx-8">
              <div className="text-4xl font-bold text-red-500">VS</div>
              <div className="h-4 bg-gray-700/50 rounded w-20 mx-auto mt-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-16 mx-auto mt-1"></div>
            </div>

            {/* 芬儿队骨架 */}
            <div className="text-center flex-1">
              <div className="h-8 bg-red-700/30 rounded-lg mb-4 w-32 mx-auto"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="flex items-center justify-end space-x-3">
                    <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-20"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-700/50"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 比赛状态骨架 */}
          <div className="mt-8 text-center">
            <div className="h-8 bg-yellow-700/30 rounded-full w-24 mx-auto"></div>
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