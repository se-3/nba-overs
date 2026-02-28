type Pick = "Over" | "Under";

export type PickRow = {
  team: string;
  line: number;
  picks: Record<string, Pick>;
};

type StandingRow = {
  team: { full_name: string; abbreviation: string };
  wins: number;
  losses: number;
};

const PLAYERS = ["Kevin", "Dave", "Nick", "Corey", "Seth"] as const;

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function buildStandingsIndex(standings: StandingRow[]) {
  const m = new Map<string, StandingRow>();

  for (const s of standings) {
    const full = norm(s.team.full_name);
    m.set(full, s);
    m.set(norm(s.team.abbreviation), s);

    if (full === norm("Los Angeles Clippers")) m.set(norm("LA Clippers"), s);
    if (full === norm("LA Clippers")) m.set(norm("Los Angeles Clippers"), s);
  }

  return m;
}

export function computePool(picks: PickRow[], standings: StandingRow[]) {
  const idx = buildStandingsIndex(standings);

  const teams = picks.map((p) => {
    const s = idx.get(norm(p.team));
    const wins = s?.wins ?? 0;
    const losses = s?.losses ?? 0;

    const gamesPlayed = wins + losses;
    const gamesRemaining = 82 - gamesPlayed;

    const winPace = gamesPlayed > 0 ? wins / gamesPlayed : 0;
    const projectedWins = winPace * 82;

    const projectedOutcome = projectedWins > p.line ? "OVER" : "UNDER";
    const close = Math.abs(projectedWins - p.line) <= 3;

    const minWinsForOver = Math.floor(p.line) + 1;
    const winsNeededForOver = Math.max(0, minWinsForOver - wins);

    const correctness: Record<string, boolean> = {};
    for (const player of PLAYERS) {
      const pick = p.picks[player];
      correctness[player] =
        (pick === "Over" && projectedOutcome === "OVER") ||
        (pick === "Under" && projectedOutcome === "UNDER");
    }

    return {
      team: p.team,
      abbr: s?.team.abbreviation ?? "",
      line: p.line,
      wins,
      losses,
      gamesPlayed,
      gamesRemaining,
      projectedWins,
      projectedOutcome,
      close,
      minWinsForOver,
      winsNeededForOver,
      picks: p.picks,
      correctness,
    };
  });

  const leaderboard = PLAYERS.map((player) => {
    const correct = teams.filter((t) => t.correctness[player]).length;
    const total = teams.length;
    return {
      player,
      correct,
      incorrect: total - correct,
      pct: total > 0 ? correct / total : 0,
    };
  }).sort((a, b) => b.correct - a.correct);

  return { updatedAt: new Date().toISOString(), leaderboard, teams };
}