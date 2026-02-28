import { NextResponse } from "next/server";
import picks from "@/data/picks-2025.json";
import { computePool } from "@/lib/compute";

export const revalidate = 60 * 60 * 12; // refresh ~2x/day

type StandingRow = {
  team: { full_name: string; abbreviation: string };
  wins: number;
  losses: number;
};

type EspnEntry = {
  team?: { displayName?: string; abbreviation?: string };
  stats?: Array<{ name?: string; value?: number; displayValue?: string }>;
};

function getStat(entry: EspnEntry, statName: "wins" | "losses"): number {
  const s = (entry.stats ?? []).find((x) => x?.name === statName);
  const v = s?.value;
  return typeof v === "number" ? v : 0;
}

function collectEntries(node: any, out: EspnEntry[]) {
  if (!node || typeof node !== "object") return;

  const entries: EspnEntry[] | undefined = node?.standings?.entries;
  if (Array.isArray(entries)) out.push(...entries);

  const children: any[] | undefined = node?.children;
  if (Array.isArray(children)) {
    for (const c of children) collectEntries(c, out);
  }
}

function parseEspnStandings(root: any): StandingRow[] {
  const entries: EspnEntry[] = [];
  collectEntries(root, entries);

  const rows: StandingRow[] = [];
  for (const e of entries) {
    const name = e?.team?.displayName ?? "";
    const abbr = e?.team?.abbreviation ?? "";
    if (!name) continue;

    rows.push({
      team: { full_name: name, abbreviation: abbr },
      wins: getStat(e, "wins"),
      losses: getStat(e, "losses"),
    });
  }

  // De-dupe by team name in case the API includes multiple grouping layers
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = r.team.full_name;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export async function GET() {
  try {
    // ESPN NBA standings JSON: includes nested children -> standings -> entries -> stats(wins/losses)
    // Example structure shows wins/losses inside entries[].stats. :contentReference[oaicite:1]{index=1}
    const url =
      "https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?contentorigin=espn&lang=en&region=us";

    const res = await fetch(url, {
      next: { revalidate },
      headers: { "User-Agent": "nba-overs/1.0" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to fetch ESPN standings", status: res.status, details: text || undefined },
        { status: 500 }
      );
    }

    const json = await res.json();
    const standings = parseEspnStandings(json);

    const out = computePool(picks as any, standings as any);
    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Exception while building pool", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}