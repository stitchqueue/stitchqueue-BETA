"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-plum text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
        <button onClick={() => router.push("/")} className="text-left">
          <h1 className="font-display font-bold text-2xl tracking-wide">
            StitchQueue
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Project tracking for professional quilters
          </p>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/board")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Board"
          >
            📊
          </button>
          <button
            onClick={() => router.push("/archive")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Archive"
          >
            🗄️
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
