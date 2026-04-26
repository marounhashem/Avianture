import Link from "next/link";
import { Mail } from "lucide-react";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-navy-700 bg-navy-900 p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10">
          <Mail className="h-5 w-5 text-amber-400" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-slate-400">
          {email ? (
            <>
              We sent a sign-in link to <span className="text-slate-200">{email}</span>.
            </>
          ) : (
            <>We sent a sign-in link to your email.</>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500">The link expires in 30 minutes.</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-xs text-amber-400 hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
