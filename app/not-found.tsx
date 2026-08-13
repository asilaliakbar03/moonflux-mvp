import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        {/* Glitch 404 */}
        <div className="relative mb-6">
          <h1
            className="text-[120px] sm:text-[180px] font-black leading-none tracking-tighter text-white dark:text-white"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            404
          </h1>
          <div
            className="absolute inset-0 text-[120px] sm:text-[180px] font-black leading-none tracking-tighter opacity-20 text-[#6366F1] dark:text-[#10B981]"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              transform: "translate(3px, 3px)",
            }}
          >
            404
          </div>
        </div>

        {/* Message */}
        <div className="border-2 p-4 mb-6 border-[rgba(255,255,255,0.2)] bg-black dark:border-[rgba(255,255,255,0.2)] dark:bg-black">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            // PAGE NOT FOUND
          </p>
          <p className="text-sm font-bold uppercase mt-2 text-white">
            THE COORDINATES YOU ENTERED DON&apos;T EXIST IN THIS GALAXY.
          </p>
          <p className="text-xs font-mono uppercase mt-1 text-gray-500">
            ERR::ROUTE_NOT_FOUND — CHECK YOUR URL AND TRY AGAIN.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 text-xs font-black uppercase border-2 text-center transition-all bg-[#10B981] text-black border-[#10B981] hover:brightness-110"
          >
            [ RETURN HOME ]
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 text-xs font-black uppercase border-2 text-center transition-all bg-black text-white border-gray-700 hover:border-[#10B981]"
          >
            [ EXPLORE TOKENS ]
          </Link>
        </div>

        {/* Terminal-style footer */}
        <div className="mt-8 text-[10px] font-mono uppercase text-gray-600">
          <span className="text-[#10B981]">&gt;</span>{" "}
          MOONFLUXX_v1.0 // STATUS: LOST_IN_SPACE
        </div>
      </div>
    </div>
  );
}
