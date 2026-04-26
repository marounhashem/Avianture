import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "amber" | "red" | "slate" | "emerald";

const toneClasses: Record<Tone, string> = {
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-500",
  red: "border-red-500/40 bg-red-500/10 text-red-300 hover:border-red-500",
  slate: "border-slate-500/40 bg-slate-500/10 text-slate-300 hover:border-slate-500",
  emerald:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500",
};

export function StatCard({
  href,
  emoji,
  count,
  label,
  tone,
}: {
  href: string;
  emoji: string;
  count: number;
  label: string;
  tone: Tone;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg border bg-navy-900 p-4 transition-colors",
        toneClasses[tone],
      )}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-3xl font-semibold tracking-tight">{count}</span>
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </Link>
  );
}
