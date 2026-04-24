import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-navy-700 bg-navy-900 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Avianture<span className="text-amber-500">.</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to continue</p>
        </div>
        <form action={loginAction as unknown as (fd: FormData) => void} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500" />
          </div>
          <button type="submit" className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400 transition-colors">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
