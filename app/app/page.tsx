import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";

export default async function AppIndex() {
  const user = await requireAuth();
  if (user.role === "OPERATOR") redirect("/app/flights");
  if (user.role === "HANDLER") redirect("/app/hub");
  if (user.role === "CREW") redirect("/app/schedule");
  redirect("/app/account");
}
