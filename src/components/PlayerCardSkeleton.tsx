export default function PlayerCardSkeleton() {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-red-900/30 aspect-[3/4] animate-pulse">
      <div className="text-center mb-4">
        {/* 头像骨架 */}
        <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-700/50"></div>
        
        {/* 名称骨架 */}
        <div className="h-6 bg-gray-700/50 rounded-md mb-1 w-3/4 mx-auto"></div>
        
        {/* 位置骨架 */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-gray-700/50"></div>
          <div className="h-4 bg-gray-700/50 rounded w-16"></div>
        </div>
        
        {/* 英雄骨架 */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((index) => (
            <div 
              key={index}
              className="h-10 w-10 bg-gray-700/50 rounded-md"
            />
          ))}
        </div>
      </div>

      {/* 统计数据骨架 */}
      <div className="flex flex-col space-y-3">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-red-900/30">
            <div className="h-4 bg-gray-700/50 rounded w-12"></div>
            <div className="h-4 bg-gray-700/50 rounded w-16"></div>
          </div>
        ))}
        
        {/* 进度条骨架 */}
        <div className="mt-auto pt-3">
          <div className="w-full bg-red-950/50 rounded-full h-2">
            <div className="h-2 bg-gray-700/50 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}