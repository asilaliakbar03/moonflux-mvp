export default function TerminalLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] text-white font-mono flex flex-col gap-4">
      {/* Top Loading Indicator */}
      <div className="flex items-center justify-between border-2 border-gray-800 p-3 bg-black/40">
        <div className="text-xs uppercase tracking-widest text-gray-500 animate-pulse font-bold">
          [ LOADING TERMINAL... ]
        </div>
        <div className="h-4 w-24 bg-gray-800 animate-pulse" />
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Sidebar Skeleton (3 cols) */}
        <div className="lg:col-span-3 border-2 border-gray-800 p-4 space-y-4 bg-black/20 flex flex-col">
          <div className="h-4 bg-gray-800 animate-pulse w-1/2 mb-2" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-2 border-gray-800 p-3 flex justify-between items-center">
                <div className="space-y-1 w-2/3">
                  <div className="h-3 bg-gray-800 animate-pulse w-3/4" />
                  <div className="h-2 bg-gray-800 animate-pulse w-1/2" />
                </div>
                <div className="h-4 w-12 bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-gray-800 space-y-3 mt-auto">
            <div className="h-4 bg-gray-800 animate-pulse w-1/3" />
            <div className="h-10 bg-gray-800 animate-pulse border-2 border-gray-800" />
            <div className="h-10 bg-gray-800 animate-pulse border-2 border-gray-800" />
          </div>
        </div>

        {/* Center Chart Area (6 cols) */}
        <div className="lg:col-span-6 border-2 border-gray-800 p-4 space-y-4 bg-black/20 flex flex-col">
          {/* Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4 border-b-2 border-gray-800">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-gray-800 animate-pulse w-1/2" />
                <div className="h-5 bg-gray-800 animate-pulse w-3/4" />
              </div>
            ))}
          </div>

          {/* Main Chart Canvas Placeholder */}
          <div className="border-2 border-gray-800 p-4 h-96 bg-gray-900/40 relative flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 w-10 bg-gray-800 animate-pulse" />
                ))}
              </div>
              <div className="h-6 w-16 bg-gray-800 animate-pulse" />
            </div>
            {/* Chart mock lines */}
            <div className="space-y-3 my-auto">
              <div className="h-32 bg-gray-800/60 animate-pulse w-full border-2 border-gray-800" />
            </div>
            <div className="flex justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 w-8 bg-gray-800 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="border-2 border-gray-800 p-4 space-y-2">
            <div className="h-4 bg-gray-800 animate-pulse w-1/4 mb-3" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-800 animate-pulse w-full" />
            ))}
          </div>
        </div>

        {/* Right Copilot Panel (3 cols) */}
        <div className="lg:col-span-3 border-2 border-gray-800 p-4 space-y-4 bg-black/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-800">
              <div className="h-4 bg-gray-800 animate-pulse w-1/2" />
              <div className="h-3 w-3 bg-gray-800 animate-pulse rounded-full" />
            </div>

            {/* Chat message skeletons */}
            <div className="space-y-3">
              <div className="border-2 border-gray-800 p-3 space-y-2 bg-gray-900/20">
                <div className="h-3 bg-gray-800 animate-pulse w-1/3" />
                <div className="h-3 bg-gray-800 animate-pulse w-full" />
                <div className="h-3 bg-gray-800 animate-pulse w-4/5" />
              </div>
              <div className="border-2 border-gray-800 p-3 space-y-2 ml-4 bg-gray-900/40">
                <div className="h-3 bg-gray-800 animate-pulse w-1/4" />
                <div className="h-3 bg-gray-800 animate-pulse w-full" />
              </div>
              <div className="border-2 border-gray-800 p-3 space-y-2 bg-gray-900/20">
                <div className="h-3 bg-gray-800 animate-pulse w-1/3" />
                <div className="h-3 bg-gray-800 animate-pulse w-3/4" />
              </div>
            </div>
          </div>

          {/* Copilot Input area */}
          <div className="pt-4 border-t-2 border-gray-800 space-y-2">
            <div className="h-10 bg-gray-800 animate-pulse border-2 border-gray-800" />
            <div className="h-8 bg-gray-800 animate-pulse border-2 border-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
