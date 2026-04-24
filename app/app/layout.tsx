import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth/session";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  return (
    <AppShell role={user.role} userName={user.name ?? user.email ?? "User"}>
      {children}
    </AppShell>
  );
}
