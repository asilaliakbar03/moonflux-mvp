export default function ReputationLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] text-white font-mono flex flex-col gap-6">
      {/* Top Loading Indicator & Title */}
      <div className="border-2 border-gray-800 p-4 bg-black/40 space-y-3">
        <div className="text-xs uppercase tracking-widest text-gray-500 animate-pulse font-bold">
          [ LOADING REPUTATION... ]
        </div>
        <div className="h-8 w-72 bg-gray-800 animate-pulse" />
        <div className="h-4 w-96 max-w-full bg-gray-800 animate-pulse" />
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-2 border-gray-800 p-4 bg-black/20 space-y-2">
            <div className="h-3 bg-gray-800 animate-pulse w-1/2" />
            <div className="h-8 bg-gray-800 animate-pulse w-3/4" />
          </div>
        ))}
      </div>

      {/* Large Graph Area Skeleton */}
      <div className="border-2 border-gray-800 p-6 bg-black/20 space-y-6">
        {/* Graph Header / Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-gray-800">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="h-5 w-48 bg-gray-800 animate-pulse" />
            <div className="h-3 w-32 bg-gray-800 animate-pulse" />
          </div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-14 bg-gray-800 animate-pulse border-2 border-gray-800" />
            ))}
          </div>
        </div>

        {/* Graph Main Visual Block */}
        <div className="h-96 bg-gray-800/80 animate-pulse border-2 border-gray-800 w-full relative flex flex-col justify-end p-4">
          <div className="space-y-4 w-full">
            <div className="h-40 bg-gray-700/40 animate-pulse border-t-2 border-gray-700 w-full" />
          </div>
        </div>

        {/* Graph Legend */}
        <div className="pt-4 border-t-2 border-gray-800">
          <div className="h-4 w-24 bg-gray-800 animate-pulse mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-2 border-gray-800 p-3 bg-black/40 flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-800 animate-pulse border-2 border-gray-800 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-gray-800 animate-pulse w-full" />
                  <div className="h-3 bg-gray-800 animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
