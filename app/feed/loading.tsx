export default function FeedLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] text-white font-mono flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Top Loading Indicator */}
        <div className="flex items-center justify-between border-2 border-gray-800 p-3 bg-black/40">
          <div className="text-xs uppercase tracking-widest text-gray-500 animate-pulse font-bold">
            [ LOADING FEED... ]
          </div>
          <div className="h-4 w-20 bg-gray-800 animate-pulse" />
        </div>

        {/* Feed Cards */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-2 border-gray-800 p-6 bg-black/20 space-y-4">
            {/* Author Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-800 animate-pulse border-2 border-gray-800" />
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-gray-800 animate-pulse" />
                  <div className="h-3 w-20 bg-gray-800 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-800 animate-pulse" />
            </div>

            {/* Media Image Placeholder */}
            <div className="h-64 sm:h-80 bg-gray-800 animate-pulse border-2 border-gray-800 w-full" />

            {/* Text Blocks */}
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-gray-800 animate-pulse w-full" />
              <div className="h-4 bg-gray-800 animate-pulse w-11/12" />
              <div className="h-4 bg-gray-800 animate-pulse w-3/4" />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-800">
              <div className="flex gap-4">
                <div className="h-8 w-20 bg-gray-800 animate-pulse border-2 border-gray-800" />
                <div className="h-8 w-20 bg-gray-800 animate-pulse border-2 border-gray-800" />
              </div>
              <div className="h-8 w-12 bg-gray-800 animate-pulse border-2 border-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
