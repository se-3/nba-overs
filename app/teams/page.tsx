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

type ApiResponse = {
  updatedAt: string;
  leaderboard: any[];
  teams: TeamRow[];
};

const PLAYERS = ["Kevin", "Dave", "Nick", "Corey", "Seth"] as const;

function PickPill({
  value,
  ok,
}: {
  value: "Over" | "Under";
  ok: boolean;
}) {
  return (
    <span
      className={[
        "jam-pill rounded-full px-2 py-1 text-[10px] jam-font",
        ok ? "bg-white/10" : "bg-black/25 opacity-60",
      ].join(" ")}
    >
      {value.toUpperCase()}
    </span>
  );
}

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

  const teams = useMemo(() => {
    if (!data?.teams) return [];
    return [...data.teams].sort(
      (a, b) =>
        Math.abs(a.projectedWins - a.line) -
        Math.abs(b.projectedWins - b.line)
    );
  }, [data?.teams]);

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <Nav />

      <div className="mt-4 sm:mt-6 jam-card rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h1 className="jam-font text-base sm:text-lg jam-neon">
            TEAMS
          </h1>

          <button
            onClick={load}
            className="jam-pill rounded-full px-3 py-2 jam-font text-[10px] bg-black/20 hover:bg-white/10"
          >
            REFRESH
          </button>
        </div>

        {/* MOBILE VIEW */}
        <div className="mt-6 space-y-4 lg:hidden">
          {teams.map((t) => (
            <div key={t.team} className="jam-card rounded-xl p-4">
              <div className="jam-font text-sm">
                {t.team}{" "}
                <span className="opacity-60">
                  {t.abbr ? `(${t.abbr})` : ""}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] jam-font">
                <div>LINE: {t.line}</div>
                <div>W-L: {t.wins}-{t.losses}</div>
                <div>GR: {t.gamesRemaining}</div>
                <div>W NEED: {t.winsNeededForOver}</div>
                <div>PROJ: {t.projectedWins.toFixed(1)}</div>
                <div>
                  {t.projectedOutcome}
                  {t.close && " 🔥"}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-2">
                {PLAYERS.map((p) => (
                  <div key={p} className="text-center">
                    <div className="text-[9px] jam-font opacity-60">
                      {p.slice(0, 3).toUpperCase()}
                    </div>
                    <PickPill
                      value={t.picks[p]}
                      ok={t.correctness[p]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden lg:block mt-6 overflow-x-auto">
          <table className="w-full jam-table text-xs">
            <thead>
              <tr>
                <th className="py-3 pr-4 jam-font">TEAM</th>
                <th className="py-3 pr-4 jam-font">LINE</th>
                <th className="py-3 pr-4 jam-font">W-L</th>
                <th className="py-3 pr-4 jam-font">GR</th>
                <th className="py-3 pr-4 jam-font">W NEED</th>
                <th className="py-3 pr-4 jam-font">PROJ</th>
                <th className="py-3 pr-4 jam-font">OUTCOME</th>
                {PLAYERS.map((p) => (
                  <th key={p} className="py-3 pr-4 jam-font">
                    {p.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {teams.map((t) => (
                <tr key={t.team}>
                  <td className="py-3 pr-4">{t.team}</td>
                  <td className="py-3 pr-4">{t.line}</td>
                  <td className="py-3 pr-4">
                    {t.wins}-{t.losses}
                  </td>
                  <td className="py-3 pr-4">{t.gamesRemaining}</td>
                  <td className="py-3 pr-4">
                    {t.winsNeededForOver}
                  </td>
                  <td className="py-3 pr-4">
                    {t.projectedWins.toFixed(1)}
                  </td>
                  <td className="py-3 pr-4">
                    {t.projectedOutcome}
                    {t.close && " 🔥"}
                  </td>
                  {PLAYERS.map((p) => (
                    <td key={p} className="py-3 pr-4">
                      <PickPill
                        value={t.picks[p]}
                        ok={t.correctness[p]}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}