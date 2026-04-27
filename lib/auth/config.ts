import NextAuth, { type DefaultSession } from "next-auth";
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "./password";

type AppRole = "OPERATOR" | "CREW" | "HANDLER";

declare module "next-auth" {
  interface User {
    id: string;
    role: AppRole;
    operatorId: string | null;
    handlerId: string | null;
    crewMemberId: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AppRole;
      operatorId: string | null;
      handlerId: string | null;
      crewMemberId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    operatorId: string | null;
    handlerId: string | null;
    crewMemberId: string | null;
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
  role: AppRole;
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
        // Path A: magic-link token (atomic claim — single updateMany prevents
        // a check-then-update race where two concurrent requests with the same
        // token both pass `used === false` and both succeed).
        const magic = magicSchema.safeParse(creds);
        if (magic.success) {
          const { email, magicToken } = magic.data;
          const normalizedEmail = email.toLowerCase();
          const claim = await db.magicLinkToken.updateMany({
            where: {
              token: magicToken,
              used: false,
              expiresAt: { gt: new Date() },
              email: normalizedEmail,
            },
            data: { used: true },
          });
          if (claim.count !== 1) return null;
          const user = await db.user.findUnique({
            where: { email: normalizedEmail },
          });
          if (!user) return null;
          return userToSession(user);
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
          return userToSession(user);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.operatorId = user.operatorId ?? null;
        token.handlerId = user.handlerId ?? null;
        token.crewMemberId = user.crewMemberId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.operatorId = token.operatorId ?? null;
        session.user.handlerId = token.handlerId ?? null;
        session.user.crewMemberId = token.crewMemberId ?? null;
      }
      return session;
    },
  },
});
