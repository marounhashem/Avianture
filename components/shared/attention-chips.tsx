import { cn } from "@/lib/utils";

type Props = {
  unread?: number;
  issues?: number;
  pending?: number;
};

const chip =
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium";

export function AttentionChips({ unread = 0, issues = 0, pending = 0 }: Props) {
  if (unread === 0 && issues === 0 && pending === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {unread > 0 && (
        <span
          className={cn(chip, "border-amber-500/40 bg-amber-500/10 text-amber-300")}
          title={`${unread} unread message${unread === 1 ? "" : "s"}`}
        >
          💬 {unread}
        </span>
      )}
      {issues > 0 && (
        <span
          className={cn(chip, "border-red-500/40 bg-red-500/10 text-red-300")}
          title={`${issues} open issue${issues === 1 ? "" : "s"}`}
        >
          ⚠ {issues}
        </span>
      )}
      {pending > 0 && (
        <span
          className={cn(chip, "border-slate-500/40 bg-slate-500/10 text-slate-300")}
          title={`${pending} handler${pending === 1 ? "" : "s"} awaiting acceptance`}
        >
          ⏳ {pending}
        </span>
      )}
    </div>
  );
}
