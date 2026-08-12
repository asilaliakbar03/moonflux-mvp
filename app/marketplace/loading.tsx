export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] text-white font-mono flex flex-col gap-6">
      {/* Top Loading Indicator & Title */}
      <div className="border-2 border-gray-800 p-4 bg-black/40 space-y-2">
        <div className="text-xs uppercase tracking-widest text-gray-500 animate-pulse font-bold">
          [ LOADING MARKETPLACE... ]
        </div>
        <div className="h-8 w-64 bg-gray-800 animate-pulse" />
      </div>

      {/* Filter Bar */}
      <div className="border-2 border-gray-800 p-4 bg-black/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="h-10 bg-gray-800 animate-pulse border-2 border-gray-800 flex-1 max-w-md" />
        <div className="flex gap-2 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-800 animate-pulse border-2 border-gray-800 shrink-0" />
          ))}
        </div>
      </div>

      {/* 3 Listing Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-2 border-gray-800 p-4 bg-black/20 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Product / Listing Image Placeholder */}
              <div className="h-48 bg-gray-800 animate-pulse border-2 border-gray-800 w-full" />

              {/* Header & Description */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-800 animate-pulse w-3/4" />
                <div className="h-3 bg-gray-800 animate-pulse w-full" />
                <div className="h-3 bg-gray-800 animate-pulse w-2/3" />
              </div>
            </div>

            {/* Price & Buy Button */}
            <div className="space-y-3 pt-3 border-t-2 border-gray-800">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-800 animate-pulse w-1/3" />
                <div className="h-5 bg-gray-800 animate-pulse w-1/4" />
              </div>
              <div className="h-10 bg-gray-800 animate-pulse border-2 border-gray-800 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
