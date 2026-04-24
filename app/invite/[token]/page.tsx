import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isExpired } from "@/lib/invites/tokens";
import { acceptInviteAction } from "./actions";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const req = await db.handlerRequest.findUnique({
    where: { inviteToken: token },
    include: { handler: true, flight: true, services: true },
  });
  if (!req) notFound();
  const expired = isExpired(req.inviteExpiresAt);
  const accepted = !!req.inviteAcceptedAt;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Avianture<span className="text-amber-500">.</span>
          </h1>
        </div>
        <div className="rounded-xl border border-navy-700 bg-navy-900 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">Handler request</h2>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Handler: <span className="text-slate-200">{req.handler.name}</span></div>
            <div>Flight: <span className="font-mono text-amber-400">{req.flight.tailNumber}</span> {req.flight.originIcao} → {req.flight.destIcao}</div>
            <div>Airport: <span className="font-mono text-amber-400">{req.airport}</span></div>
            <div>Services: {req.services.map((s) => s.type).join(", ")}</div>
            <div>ETD: {new Date(req.flight.etdUtc).toUTCString()}</div>
          </div>
        </div>
        {expired ? (
          <p className="text-sm text-red-400 text-center">This invite link has expired. Ask the operator to send a new one.</p>
        ) : accepted ? (
          <p className="text-sm text-slate-400 text-center">This invite has already been accepted. <a className="text-amber-400 hover:underline" href="/login">Sign in</a>.</p>
        ) : (
          <form action={acceptInviteAction as unknown as (fd: FormData) => void} className="rounded-xl border border-navy-700 bg-navy-900 p-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Your name</label>
              <input name="name" required className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
              <input name="email" type="email" required defaultValue={req.handler.email ?? ""} className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Create password (min 8 chars)</label>
              <input name="password" type="password" minLength={8} required className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400">
              Accept and continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
