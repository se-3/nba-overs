"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";

type LeaderRow = { player: string; correct: number; incorrect: number; pct: number };
type ApiResponse = { updatedAt: string; leaderboard: LeaderRow[]; teams: any[] };

export default function Page() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/pool", { cache: "no-store" });
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const updated = useMemo(() => {
    if (!data?.updatedAt) return "";
    return new Date(data.updatedAt).toLocaleString();
  }, [data?.updatedAt]);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <Nav />

      <div className="mt-6 jam-card rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="jam-font text-lg jam-neon">CURRENT STANDINGS</h1>
          <button
            onClick={load}
            className="jam-pill rounded-full px-4 py-2 jam-font text-xs bg-black/20 hover:bg-white/10"
          >
            REFRESH
          </button>
        </div>

        <div className="mt-2 text-xs opacity-80">
          {loading ? "Loading…" : `Updated: ${updated}`}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full jam-table text-sm">
            <thead>
              <tr className="text-left opacity-90">
                <th className="py-3 pr-3 jam-font text-xs">RANK</th>
                <th className="py-3 pr-3 jam-font text-xs">PLAYER</th>
                <th className="py-3 pr-3 jam-font text-xs">CORRECT</th>
                <th className="py-3 pr-3 jam-font text-xs">WRONG</th>
                <th className="py-3 pr-3 jam-font text-xs">PCT</th>
              </tr>
            </thead>
            <tbody>
              {data?.leaderboard?.map((r, i) => (
                <tr key={r.player} className="hover:bg-white/5">
                  <td className="py-3 pr-3 jam-font text-xs">{i + 1}</td>
                  <td className="py-3 pr-3 jam-font text-xs">{r.player}</td>
                  <td className="py-3 pr-3">{r.correct}</td>
                  <td className="py-3 pr-3">{r.incorrect}</td>
                  <td className="py-3 pr-3">{Math.round(r.pct * 100)}%</td>
                </tr>
              ))}
              {!loading && !data?.leaderboard?.length && (
                <tr>
                  <td className="py-4 opacity-80" colSpan={5}>
                    No data yet — check /api/pool.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-xs opacity-80">
          Score is based on the current projected OVER/UNDER from win pace (wins / games played × 82).
        </div>
      </div>
    </main>
  );
}