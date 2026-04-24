import { cn } from "@/lib/utils";

export type ChipStatus = "pending" | "acknowledged" | "in_progress" | "completed";

const map: Record<ChipStatus, { label: string; color: string; dot: string }> = {
  pending:      { label: "Pending",      color: "text-slate-400 border-slate-500/40 bg-slate-500/10", dot: "bg-slate-400" },
  acknowledged: { label: "Acknowledged", color: "text-blue-300 border-blue-500/40 bg-blue-500/10",    dot: "bg-blue-400" },
  in_progress:  { label: "In progress",  color: "text-amber-300 border-amber-500/40 bg-amber-500/10", dot: "bg-amber-400" },
  completed:    { label: "Completed",    color: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10", dot: "bg-emerald-400" },
};

export function StatusChip({ status }: { status: ChipStatus }) {
  const s = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", s.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
