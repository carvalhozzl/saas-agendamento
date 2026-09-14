import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { OrgRole, PlatformRole } from "@prisma/client";

export type SessionMembership = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrgRole;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      platformRole: PlatformRole;
      memberships: SessionMembership[];
      activeOrganizationId: string | null;
    };
  }
}

interface AppToken {
  id: string;
  platformRole: PlatformRole;
  memberships: SessionMembership[];
  activeOrganizationId: string | null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as unknown as AppToken;
      // On sign-in, load fresh membership data onto the token.
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            memberships: { include: { organization: true } },
          },
        });
        if (dbUser) {
          appToken.id = dbUser.id;
          appToken.platformRole = dbUser.platformRole;
          appToken.memberships = dbUser.memberships.map((m) => ({
            organizationId: m.organizationId,
            organizationName: m.organization.name,
            organizationSlug: m.organization.slug,
            role: m.role,
          }));
          appToken.activeOrganizationId = dbUser.memberships[0]?.organizationId ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const appToken = token as unknown as AppToken;
      session.user.id = appToken.id;
      session.user.platformRole = appToken.platformRole;
      session.user.memberships = appToken.memberships ?? [];
      session.user.activeOrganizationId = appToken.activeOrganizationId ?? null;
      return session;
    },
  },
});
