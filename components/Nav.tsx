"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab({ href, label }: { href: string; label: string }) {
  const path = usePathname();
  const active = path === href;

  return (
    <Link
      href={href}
      className={[
        "jam-pill px-4 py-2 rounded-full jam-font text-xs",
        active ? "bg-white/15" : "bg-black/20 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Nav() {
  return (
    <div className="flex items-center justify-between gap-4 jam-card rounded-2xl p-4">
      <div className="jam-font text-sm jam-neon">
        🏀 Basketball Chat Over/Under
      </div>
      <div className="flex gap-2">
        <Tab href="/" label="LEADERBOARD" />
        <Tab href="/teams" label="TEAMS" />
      </div>
    </div>
  );
}