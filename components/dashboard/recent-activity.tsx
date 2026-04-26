import Link from "next/link";
import type { FlightMessage, User, Flight } from "@prisma/client";

type ActivityItem = FlightMessage & {
  author: User;
  flight: Pick<Flight, "id" | "tailNumber">;
};

function relative(d: Date): string {
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toUTCString().slice(5, 16); // "01 Jan 2026"
}

export function RecentActivity({ messages }: { messages: ActivityItem[] }) {
  if (messages.length === 0) {
    return (
      <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Recent activity</h2>
        <p className="text-sm text-slate-500">
          No thread messages yet. Start a conversation on any flight.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Recent activity</h2>
      <ul className="space-y-2">
        {messages.map((m) => (
          <li key={m.id}>
            <Link
              href={`/app/flights/${m.flight.id}`}
              className="block rounded-md border border-navy-700 bg-navy-950 p-3 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-mono text-xs text-amber-400 shrink-0">
                    {m.flight.tailNumber}
                  </span>
                  <span className="text-xs font-medium text-slate-200 shrink-0">
                    {m.author.name}
                  </span>
                  <span className="text-xs text-slate-500 shrink-0">
                    {m.author.role}
                  </span>
                </div>
                <span className="text-xs text-slate-500 shrink-0">
                  {relative(m.createdAt)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                {m.body.length > 120 ? m.body.slice(0, 120) + "…" : m.body}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
