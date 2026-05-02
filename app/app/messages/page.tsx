import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { lastSeenMap } from "@/lib/flights/views";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 100;

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

/**
 * Unified message inbox — all flight thread messages this user can see across
 * every flight, newest first. Click a row to jump straight to that flight's
 * thread (the FlightThread component handles its own seen/unread tracking).
 *
 * Operator scope: messages on flights they own.
 * Handler scope:  messages on flights where they have a HandlerRequest.
 * Crew scope:     messages on flights where they have a CrewAssignment.
 */
export default async function MessagesPage() {
  const user = await requireAuth();
  if (user.role === "HANDLER") redirect("/app/hub");
  if (user.role === "CREW") redirect("/app/schedule");
  if (user.role !== "OPERATOR" || !user.operatorId) {
    redirect("/app/account");
  }

  const messages = await db.flightMessage.findMany({
    where: {
      flight: { operatorId: user.operatorId },
      deletedAt: null,
    },
    include: {
      author: { select: { id: true, name: true, role: true } },
      flight: { select: { id: true, tailNumber: true, originIcao: true, destIcao: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  const seen = await lastSeenMap(
    user.id,
    Array.from(new Set(messages.map((m) => m.flightId))),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-slate-400">
          All flight thread messages, newest first. Tap a row to open that
          flight&apos;s thread.
        </p>
      </header>

      {messages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-700 p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm text-slate-400">
            No messages yet. Start a conversation on any flight.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => {
            const lastSeenAt = seen.get(m.flightId);
            const unread = !lastSeenAt || m.createdAt > lastSeenAt;
            const isMine = m.author.id === user.id;
            return (
              <li key={m.id}>
                <Link
                  href={`/app/flights/${m.flight.id}`}
                  className={cn(
                    "block rounded-md border bg-navy-950 p-3 transition-colors",
                    unread && !isMine
                      ? "border-amber-500/40 hover:border-amber-500"
                      : "border-navy-700 hover:border-amber-500/40",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="font-mono text-xs text-amber-400 shrink-0">
                        {m.flight.tailNumber}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0 font-mono">
                        {m.flight.originIcao} → {m.flight.destIcao}
                      </span>
                      <span className="text-xs font-medium text-slate-200 shrink-0">
                        {m.author.name}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0">
                        {m.author.role}
                      </span>
                      {unread && !isMine && (
                        <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                          new
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {relative(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                    {m.body.length > 200 ? m.body.slice(0, 200) + "…" : m.body}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
