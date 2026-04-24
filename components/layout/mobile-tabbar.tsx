"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plane, Users, Building2, LayoutDashboard, CircleUser } from "lucide-react";

export function MobileTabBar({ role }: { role: "OPERATOR" | "HANDLER" | "CREW" }) {
  const pathname = usePathname();
  const items = role === "OPERATOR"
    ? [
        { href: "/app/flights",  label: "Flights",  icon: Plane },
        { href: "/app/crew",     label: "Crew",     icon: Users },
        { href: "/app/handlers", label: "Handlers", icon: Building2 },
        { href: "/app/account",  label: "Me",       icon: CircleUser },
      ]
    : [
        { href: "/app/hub",     label: "Hub",  icon: LayoutDashboard },
        { href: "/app/account", label: "Me",   icon: CircleUser },
      ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-navy-700 bg-navy-900 grid grid-cols-4">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 py-2 text-xs", active ? "text-amber-400" : "text-slate-400")}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
