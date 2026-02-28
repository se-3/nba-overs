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
const PLAYER_SHORT: Record<(typeof PLAYERS)[number], string> = {
  Kevin: "KEV",
  Dave: "DAVE",
  Nick: "NICK",
  Corey: "COREY",
  Seth: "SETH",
};

function useIsMobile(breakpointPx = 900) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);

  return isMobile;
}

function PickPill({ value, ok }: { value: "Over" | "Under"; ok: boolean }) {
  return (
    <span
      className={[
        "jam-pill rounded-full px-2 py-1 jam-font",
        ok ? "bg-white/10" : "bg-black/25 opacity-70",
      ].join(" ")}
      title={ok ? "Currently correct" : "Currently incorrect"}
    >
      {value.toUpperCase()}
    </span>
  );
}

export default function TeamsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile(900);

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
    return [...data.teams].sort(
      (a, b) => Math.abs(a.projectedWins - a.line) - Math.abs(b.projectedWins - b.line)
    );
  }, [data?.teams]);

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <Nav />

      <div className="mt-4 sm:mt-6 jam-card rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="jam-font text-base sm:text-lg jam-neon">TEAMS</h1>
          <button
            onClick={load}
            className="jam-pill rounded-full px-3 sm:px-4 py-2 jam-font text-[10px] sm:text-xs bg-black/20 hover:bg-white/10"
          >
            REFRESH
          </button>
        </div>

        <div className="mt-2 text-[10px] sm:text-xs opacity-80 leading-relaxed">
          {loading ? "Loading…" : `Updated: ${updated}`} · GR = games remaining · W Needed (Over) =
          wins needed to finish above the line
        </div>

        {/* MOBILE / SMALL WINDOWS: CARD VIEW */}
        {isMobile ? (
          <div className="mt-4 grid gap-3">
            {teams.map((t) => (
              <div key={t.team} className="jam-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="jam-font text-sm sm:text-base">
                      {t.team}{" "}
                      <span className="opacity-70">{t.abbr ? `(${t.abbr})` : ""}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] jam-font">
                      <span className="jam-pill rounded-full px-2 py-1 bg-black/20">
                        LINE {t.line.toFixed(1)}
                      </span>
                      <span className="jam-pill rounded-full px-2 py-1 bg-black/20">
                        W-L {t.wins}-{t.losses}
                      </span>
                      <span className="jam-pill rounded-full px-2 py-1 bg-black/20">
                        GR {t.gamesRemaining}
                      </span>
                      <span className="jam-pill rounded-full px-2 py-1 bg-black/20">
                        W NEED {t.winsNeededForOver}
                      </span>
                      <span className="jam-pill rounded-full px-2 py-1 bg-black/20">
                        PROJ {t.projectedWins.toFixed(1)}
                      </span>
                      <span
                        className={[
                          "jam-pill rounded-full px-2 py-1",
                          t.projectedOutcome === "OVER" ? "bg-white/10 jam-neon" : "bg-black/25",
                        ].join(" ")}
                      >
                        {t.projectedOutcome}
                      </span>
                      {t.close ? (
                        <span className="jam-pill rounded-full px-2 py-1 bg-white/10 jam-font">
                          🔥 CLOSE
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-5 gap-2">
                  {PLAYERS.map((p) => (
                    <div key={p} className="text-center">
                      <div className="jam-font text-[9px] opacity-80 mb-1">
                        {PLAYER_SHORT[p]}
                      </div>
                      <PickPill value={t.picks[p]} ok={t.correctness[p]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {!loading && !teams.length && (
              <div className="py-6 opacity-80 text-sm">No data yet — check /api/pool.</div>
            )}
          </div>
        ) : (
          /* DESKTOP: TABLE VIEW (still scrollable, but readable) */
          <div className="mt-6 overflow-x-auto">
            <table className="w-full jam-table text-xs">
              <thead>
                <tr className="text-left opacity-90">
                  <th className="py-3 pr-4 jam-font">TEAM</th>
                  <th className="py-3 pr-4 jam-font">LINE</th>
                  <th className="py-3 pr-4 jam-font">W-L</th>
                  <th className="py-3 pr-4 jam-font">GR</th>
                  <th className="py-3 pr-4 jam-font">W NEED (OVER)</th>
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

                    {PLAYERS.map((p) => (
                      <td key={p} className="py-3 pr-4">
                        <PickPill value={t.picks[p]} ok={t.correctness[p]} />
                      </td>
                    ))}
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
        )}

        <div className="mt-4 text-[10px] sm:text-xs opacity-80">
          Tip: Teams are sorted by how close their projected wins are to the line (most dramatic at
          top).
        </div>
      </div>
    </main>
  );
}