import type { ServiceStatusLog, User } from "@prisma/client";

export function StatusTimeline({ logs }: { logs: (ServiceStatusLog & { changedBy: User })[] }) {
  if (logs.length === 0) return null;
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Timeline</h2>
      <ul className="space-y-2 text-xs text-slate-400">
        {logs.map((l) => (
          <li key={l.id}>
            <span className="text-slate-500">{new Date(l.changedAt).toUTCString().slice(5, 22)} UTC</span>
            {" · "}
            <span>{l.changedBy.name}</span>
            {" — "}
            <span className="font-mono">{l.fromStatus} → {l.toStatus}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
