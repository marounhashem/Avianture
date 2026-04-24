"use server";
import { signIn } from "@/lib/auth/config";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function loginAction(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid input" };
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/app" });
  } catch (e: any) {
    if (e?.type === "CredentialsSignin") return { error: "Invalid email or password" };
    throw e;
  }
  return { error: null };
}
