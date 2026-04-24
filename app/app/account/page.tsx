import { requireAuth } from "@/lib/auth/session";

export default async function AccountPage() {
  const user = await requireAuth();
  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:px-8 md:py-10 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <div className="rounded-lg border border-navy-700 bg-navy-900 p-5 space-y-2 text-sm">
        <Row k="Name" v={user.name ?? "—"} />
        <Row k="Email" v={user.email ?? "—"} />
        <Row k="Role" v={user.role} />
      </div>
      <form action="/api/auth/signout" method="post">
        <button type="submit" className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-slate-300 hover:border-red-500/40 hover:text-red-400">
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
