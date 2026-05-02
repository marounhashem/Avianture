import type { ServiceStatusLog, User } from "@prisma/client";

export type EnrichedStatusLog = ServiceStatusLog & {
  changedBy: User;
  serviceType: string;
  handlerName: string;
  airport: string;
};

function pretty(status: string): string {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusTimeline({ logs }: { logs: EnrichedStatusLog[] }) {
  if (logs.length === 0) return null;
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Timeline</h2>
      <ul className="space-y-2 text-xs text-slate-400">
        {logs.map((l) => (
          <li key={l.id} className="leading-relaxed">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-slate-500 font-mono">
                {new Date(l.changedAt).toUTCString().slice(5, 22)} UTC
              </span>
              <span className="text-slate-300 font-medium">
                {l.changedBy.name}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-mono">
                {l.handlerName} / {l.airport}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-mono">{l.serviceType}</span>
              <span className="text-slate-500">·</span>
              <span className="font-mono text-slate-400">
                {pretty(l.fromStatus)} → {pretty(l.toStatus)}
              </span>
            </div>
            {l.note && (
              <div className="ml-2 mt-0.5 text-[11px] text-slate-500 italic">
                &ldquo;{l.note}&rdquo;
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
