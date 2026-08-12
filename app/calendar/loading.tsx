export default function CalendarLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] text-white font-mono flex flex-col gap-6">
      {/* Top Loading Indicator & Title */}
      <div className="border-2 border-gray-800 p-4 bg-black/40 space-y-2">
        <div className="text-xs uppercase tracking-widest text-gray-500 animate-pulse font-bold">
          [ LOADING CALENDAR... ]
        </div>
        <div className="h-8 w-64 bg-gray-800 animate-pulse" />
      </div>

      {/* Filter Bar */}
      <div className="border-2 border-gray-800 p-4 bg-black/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-24 sm:w-32 bg-gray-800 animate-pulse border-2 border-gray-800" />
          ))}
        </div>
        <div className="flex gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-9 w-28 bg-gray-800 animate-pulse border-2 border-gray-800" />
          ))}
        </div>
      </div>

      {/* Day Headers (7 Columns) */}
      <div className="grid grid-cols-7 gap-2 border-2 border-gray-800 p-3 bg-black/40 text-center">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <div key={day} className="flex justify-center">
            <div className="h-4 w-12 bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>

      {/* 7-Column Calendar Grid Skeleton (5 weeks x 7 days = 35 cells) */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="border-2 border-gray-800 p-2 sm:p-3 min-h-[90px] sm:min-h-[120px] bg-black/20 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-5 bg-gray-800 animate-pulse" />
              {i % 4 === 0 && <div className="h-2 w-2 bg-gray-800 animate-pulse" />}
            </div>
            {i % 3 === 0 && (
              <div className="space-y-1 my-auto">
                <div className="h-3 bg-gray-800 animate-pulse w-full" />
                <div className="h-3 bg-gray-800 animate-pulse w-2/3" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
