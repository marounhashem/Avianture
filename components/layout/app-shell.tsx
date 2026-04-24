import { Sidebar } from "./sidebar";
import { MobileTabBar } from "./mobile-tabbar";

export function AppShell({
  role,
  userName,
  children,
}: {
  role: "OPERATOR" | "HANDLER" | "CREW";
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-50">
      <Sidebar role={role} userName={userName} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <MobileTabBar role={role} />
    </div>
  );
}
