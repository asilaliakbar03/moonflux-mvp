export default function ExploreLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] text-white font-mono flex flex-col gap-6">
      {/* Top Loading Indicator & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 border-gray-800 p-4 bg-black/40">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-gray-500 animate-pulse font-bold">
            [ LOADING EXPLORE... ]
          </div>
          <div className="h-6 w-48 bg-gray-800 animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-gray-800 animate-pulse border-2 border-gray-800" />
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="border-2 border-gray-800 p-3 bg-black/20 flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-800 animate-pulse shrink-0" />
          <div className="h-5 bg-gray-800 animate-pulse flex-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-800 animate-pulse border-2 border-gray-800" />
          ))}
        </div>
      </div>

      {/* Grid of 6 Token Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-2 border-gray-800 p-4 bg-black/20 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gray-800 animate-pulse border-2 border-gray-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-gray-800 animate-pulse w-3/4" />
                <div className="h-3 bg-gray-800 animate-pulse w-1/2" />
              </div>
            </div>

            <div className="h-32 bg-gray-800 animate-pulse border-2 border-gray-800" />

            <div className="space-y-2 pt-2 border-t-2 border-gray-800">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-800 animate-pulse w-1/3" />
                <div className="h-3 bg-gray-800 animate-pulse w-1/4" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-800 animate-pulse w-2/5" />
                <div className="h-3 bg-gray-800 animate-pulse w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
