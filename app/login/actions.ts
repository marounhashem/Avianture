"use server";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/config";
import { generateAndSendMagicLink } from "@/lib/auth/magic-link";
import { z } from "zod";

const passwordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const emailOnlySchema = z.object({
  email: z.string().email(),
});

export async function loginAction(formData: FormData) {
  const parsed = passwordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/login?error=invalid-input");
  }

  let credentialsFailed = false;
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/app" });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "type" in e &&
      (e as { type: string }).type === "CredentialsSignin"
    ) {
      credentialsFailed = true;
    } else {
      // Re-throw NEXT_REDIRECT (success path) and any unknown errors
      throw e;
    }
  }

  if (credentialsFailed) {
    redirect("/login?error=invalid-credentials");
  }
}

export async function requestMagicLinkAction(formData: FormData) {
  const parsed = emailOnlySchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    redirect("/login?error=invalid-email");
  }
  const result = await generateAndSendMagicLink(parsed.data.email);
  if (!result.ok) {
    // The helper currently only reports failure on actual send error; "no such user"
    // returns ok:true silently to avoid enumeration.
    redirect("/login?error=send-failed");
  }
  redirect(`/auth/check-email?email=${encodeURIComponent(parsed.data.email)}`);
}
