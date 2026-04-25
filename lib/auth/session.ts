import { auth } from "./config";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user as NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
}

export async function requireOperator() {
  const user = await requireAuth();
  if (user.role !== "OPERATOR" || !user.operatorId) redirect("/login");
  return user as typeof user & { operatorId: string };
}

export async function requireHandler() {
  const user = await requireAuth();
  if (user.role !== "HANDLER" || !user.handlerId) redirect("/login");
  return user as typeof user & { handlerId: string };
}

export async function requireCrew() {
  const user = await requireAuth();
  if (user.role !== "CREW" || !user.crewMemberId) redirect("/login");
  return user as typeof user & { crewMemberId: string };
}
