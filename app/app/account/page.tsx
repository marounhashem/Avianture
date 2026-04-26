import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { updateNotificationPrefAction } from "./actions";

const NOTIFICATION_PREFS = [
  {
    field: "notifyOnIssueRaised" as const,
    label: "Crew issue raised",
    sub: "When a crew member flags an issue on a flight you operate.",
  },
  {
    field: "notifyOnNewMessage" as const,
    label: "New thread message",
    sub: "When someone posts a message in the flight thread.",
  },
  {
    field: "notifyOnServiceStatus" as const,
    label: "Service status update",
    sub: "When a handler updates fuel / catering / etc. status.",
  },
  {
    field: "notifyOnIssueResolved" as const,
    label: "Crew issue resolved",
    sub: "When an operator resolves an issue you raised.",
  },
];

export default async function AccountPage() {
  const sessionUser = await requireAuth();
  // Pull the full user (the session JWT doesn't carry pref flags).
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notifyOnIssueRaised: true,
      notifyOnNewMessage: true,
      notifyOnServiceStatus: true,
      notifyOnIssueResolved: true,
    },
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>

      <div className="rounded-lg border border-navy-700 bg-navy-900 p-5 space-y-2 text-sm">
        <Row k="Name" v={user?.name ?? "—"} />
        <Row k="Email" v={user?.email ?? "—"} />
        <Row k="Role" v={user?.role ?? "—"} />
      </div>

      <section className="rounded-lg border border-navy-700 bg-navy-900 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-300">Email notifications</h2>
          <p className="mt-1 text-xs text-slate-500">
            Choose which events should trigger an email. Magic-link sign-in
            emails are always sent.
          </p>
        </div>
        <ul className="divide-y divide-navy-700">
          {NOTIFICATION_PREFS.map(({ field, label, sub }) => {
            const enabled = !!user?.[field];
            return (
              <li key={field} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm">{label}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{sub}</div>
                </div>
                <form
                  action={
                    updateNotificationPrefAction as unknown as (
                      fd: FormData,
                    ) => void
                  }
                >
                  <input type="hidden" name="field" value={field} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={enabled ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    aria-pressed={enabled}
                    className={
                      enabled
                        ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:border-emerald-500"
                        : "rounded-full border border-slate-500/40 bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-400 hover:border-slate-500"
                    }
                  >
                    {enabled ? "On" : "Off"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <form action="/api/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-slate-300 hover:border-red-500/40 hover:text-red-400"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{k}</span>
      <span className="font-mono text-sm">{v}</span>
    </div>
  );
}
