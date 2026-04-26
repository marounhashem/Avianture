import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/config";

export default async function MagicAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;
  if (!token || !email) {
    redirect("/login?error=invalid-link");
  }

  try {
    await signIn("credentials", {
      email,
      magicToken: token,
      redirectTo: "/app",
    });
  } catch (e: unknown) {
    // Auth.js throws NEXT_REDIRECT on success — re-throw so Next.js handles it.
    if (
      typeof e === "object" &&
      e !== null &&
      "digest" in e &&
      typeof (e as { digest: unknown }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw e;
    }
    redirect("/login?error=link-expired");
  }

  // Unreachable — signIn either redirects or throws.
  redirect("/app");
}
