import Link from "next/link";
import { loginAction, requestMagicLinkAction } from "./actions";

const errorMessages: Record<string, string> = {
  "invalid-input": "Please enter a valid email and password.",
  "invalid-credentials":
    "That email and password don't match. Check both and try again — passwords are case-sensitive.",
  "invalid-email": "Please enter a valid email address.",
  "send-failed": "Couldn't send the sign-in email. Try the password form instead.",
  "invalid-link": "That sign-in link is missing details. Request a new one.",
  "link-expired": "That sign-in link has expired or been used. Request a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const { mode, error } = await searchParams;
  const isMagicMode = mode === "magic";
  const errorText = error ? errorMessages[error] : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-navy-700 bg-navy-900 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Avianture<span className="text-amber-500">.</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isMagicMode ? "Get a sign-in link by email" : "Sign in to continue"}
          </p>
        </div>

        {errorText && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorText}
          </div>
        )}

        {isMagicMode ? (
          <form
            action={requestMagicLinkAction as unknown as (fd: FormData) => void}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400 transition-colors"
            >
              Send sign-in link
            </button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-xs text-slate-400 hover:text-amber-400"
              >
                ← Back to password sign in
              </Link>
            </div>
          </form>
        ) : (
          <form
            action={loginAction as unknown as (fd: FormData) => void}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400 transition-colors"
            >
              Sign in
            </button>
            <div className="text-center">
              <Link
                href="/login?mode=magic"
                className="text-xs text-slate-400 hover:text-amber-400"
              >
                Email me a sign-in link instead
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
