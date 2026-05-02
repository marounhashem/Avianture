"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plane, Users, Building2, LayoutDashboard, CircleUser, LogOut, CalendarDays, Home, MessageSquare } from "lucide-react";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const operatorItems: Item[] = [
  { href: "/app",           label: "Home",      icon: Home },
  { href: "/app/flights",   label: "Flights",   icon: Plane },
  { href: "/app/crew",      label: "Crew",      icon: Users },
  { href: "/app/handlers",  label: "Handlers",  icon: Building2 },
  { href: "/app/messages",  label: "Messages",  icon: MessageSquare },
];
const handlerItems: Item[] = [
  { href: "/app/hub", label: "Handler Hub", icon: LayoutDashboard },
];
const crewItems: Item[] = [
  { href: "/app/schedule", label: "Schedule", icon: CalendarDays },
];

export function Sidebar({ role, userName }: { role: "OPERATOR" | "HANDLER" | "CREW"; userName: string }) {
  const pathname = usePathname();
  const items =
    role === "OPERATOR" ? operatorItems
    : role === "HANDLER" ? handlerItems
    : crewItems;
  return (
    <aside className="hidden md:flex h-screen w-60 flex-col border-r border-navy-700 bg-navy-900">
      <div className="px-5 py-6">
        <Link href="/app" className="text-lg font-semibold tracking-tight">
          Avianture<span className="text-amber-500">.</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          // Exact match for /app (the Home item) so it isn't always active.
          const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-navy-800 text-slate-50" : "text-slate-400 hover:bg-navy-800/60 hover:text-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-navy-700 px-3 py-4 space-y-1">
        <Link href="/app/account" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-navy-800/60 hover:text-slate-50">
          <CircleUser className="h-4 w-4" /> {userName}
        </Link>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-navy-800/60 hover:text-slate-50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
