"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";

type TeamRow = {
  team: string;
  abbr: string;
  line: number;
  wins: number;
  losses: number;
  gamesRemaining: number;
  projectedWins: number;
  projectedOutcome: "OVER" | "UNDER";
  close: boolean;
  winsNeededForOver: number;
  picks: Record<string, "Over" | "Under">;
  correctness: Record<string, boolean>;
};

type ApiResponse = { updatedAt: string; leaderboard: any[]; teams: TeamRow[] };

const PLAYERS = ["Kevin", "Dave", "Nick", "Corey", "Seth"] as const;

export default function TeamsPage() {
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

  const teams = useMemo(() => {
    if (!data?.teams) return [];
    // Sort by "how close to the line" so drama rises to the top
    return [...data.teams].sort(
      (a, b) => Math.abs(a.projectedWins - a.line) - Math.abs(b.projectedWins - b.line)
    );
  }, [data?.teams]);

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Nav />

      <div className="mt-6 jam-card rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="jam-font text-lg jam-neon">TEAMS</h1>
          <button
            onClick={load}
            className="jam-pill rounded-full px-4 py-2 jam-font text-xs bg-black/20 hover:bg-white/10"
          >
            REFRESH
          </button>
        </div>

        <div className="mt-2 text-xs opacity-80">
          {loading ? "Loading…" : `Updated: ${updated}`} · GR = games remaining · W Needed (Over) = wins
          needed to finish above the line
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full jam-table text-xs">
            <thead>
              <tr className="text-left opacity-90">
                <th className="py-3 pr-4 jam-font">TEAM</th>
                <th className="py-3 pr-4 jam-font">LINE</th>
                <th className="py-3 pr-4 jam-font">W-L</th>
                <th className="py-3 pr-4 jam-font">GR</th>
                <th className="py-3 pr-4 jam-font">W NEEDED (OVER)</th>
                <th className="py-3 pr-4 jam-font">PROJ W</th>
                <th className="py-3 pr-4 jam-font">PROJ</th>
                <th className="py-3 pr-4 jam-font">CLOSE?</th>
                {PLAYERS.map((p) => (
                  <th key={p} className="py-3 pr-4 jam-font">
                    {p.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.team} className="hover:bg-white/5">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className="jam-font">{t.team}</span>{" "}
                    <span className="opacity-70">{t.abbr ? `(${t.abbr})` : ""}</span>
                  </td>
                  <td className="py-3 pr-4">{t.line.toFixed(1)}</td>
                  <td className="py-3 pr-4">
                    {t.wins}-{t.losses}
                  </td>
                  <td className="py-3 pr-4">{t.gamesRemaining}</td>
                  <td className="py-3 pr-4">{t.winsNeededForOver}</td>
                  <td className="py-3 pr-4">{t.projectedWins.toFixed(1)}</td>
                  <td className="py-3 pr-4">
                    <span className={t.projectedOutcome === "OVER" ? "jam-neon" : ""}>
                      {t.projectedOutcome}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {t.close ? (
                      <span className="jam-pill rounded-full px-2 py-1 jam-font bg-white/10">
                        🔥 CLOSE
                      </span>
                    ) : (
                      <span className="opacity-70">—</span>
                    )}
                  </td>

                  {PLAYERS.map((p) => {
                    const pick = t.picks[p];
                    const ok = t.correctness[p];
                    return (
                      <td key={p} className="py-3 pr-4">
                        <span
                          className={[
                            "jam-pill rounded-full px-2 py-1 jam-font",
                            ok ? "bg-white/10" : "bg-black/25 opacity-70",
                          ].join(" ")}
                          title={ok ? "Currently correct" : "Currently incorrect"}
                        >
                          {pick.toUpperCase()}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {!loading && !teams.length && (
                <tr>
                  <td className="py-4 opacity-80" colSpan={8 + PLAYERS.length}>
                    No data yet — check /api/pool.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-xs opacity-80">
          Tip: Teams are sorted by how close their projected wins are to the line (most dramatic at top).
        </div>
      </div>
    </main>
  );
}