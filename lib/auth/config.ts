import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "./password";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "OPERATOR" | "CREW" | "HANDLER";
      operatorId?: string | null;
      handlerId?: string | null;
      crewMemberId?: string | null;
    };
  }
}

const pwSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const magicSchema = z.object({
  email: z.string().email(),
  magicToken: z.string().min(10),
});

function userToSession(user: {
  id: string;
  email: string;
  name: string;
  role: "OPERATOR" | "CREW" | "HANDLER";
  operatorId: string | null;
  handlerId: string | null;
  crewMemberId: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    operatorId: user.operatorId,
    handlerId: user.handlerId,
    crewMemberId: user.crewMemberId,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, magicToken: {} },
      authorize: async (creds) => {
        // Path A: magic-link token
        const magic = magicSchema.safeParse(creds);
        if (magic.success) {
          const { email, magicToken } = magic.data;
          const tokenRow = await db.magicLinkToken.findUnique({
            where: { token: magicToken },
          });
          if (!tokenRow) return null;
          if (tokenRow.used) return null;
          if (tokenRow.expiresAt < new Date()) return null;
          if (tokenRow.email !== email.toLowerCase()) return null;
          const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
          });
          if (!user) return null;
          await db.magicLinkToken.update({
            where: { id: tokenRow.id },
            data: { used: true },
          });
          return userToSession(user) as any;
        }

        // Path B: email + password
        const pw = pwSchema.safeParse(creds);
        if (pw.success) {
          const user = await db.user.findUnique({
            where: { email: pw.data.email.toLowerCase() },
          });
          if (!user) return null;
          const ok = await verifyPassword(pw.data.password, user.passwordHash);
          if (!ok) return null;
          return userToSession(user) as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.operatorId = (user as any).operatorId ?? null;
        token.handlerId = (user as any).handlerId ?? null;
        token.crewMemberId = (user as any).crewMemberId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).operatorId = token.operatorId ?? null;
        (session.user as any).handlerId = token.handlerId ?? null;
        (session.user as any).crewMemberId = token.crewMemberId ?? null;
      }
      return session;
    },
  },
});
