import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import type { OrgRole } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "Não autorizado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * The single choke point every server action / route handler must go
 * through before touching tenant data. It resolves the caller's session,
 * confirms they hold a membership in the requested organization, and
 * returns a scoped context — organizationId comes from THIS, never from
 * client input, so a request can never read or write another tenant's rows.
 */
export async function requireOrgContext(minRole?: OrgRole[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) {
    redirect("/onboarding");
  }

  const membership = session.user.memberships.find(
    (m) => m.organizationId === organizationId
  );
  if (!membership) {
    throw new UnauthorizedError("Você não pertence a esta organização.");
  }

  if (minRole && !minRole.includes(membership.role)) {
    throw new UnauthorizedError(
      "Você não tem permissão para executar esta ação."
    );
  }

  return {
    userId: session.user.id,
    organizationId,
    role: membership.role,
    organizationSlug: membership.organizationSlug,
  };
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.platformRole !== "SUPER_ADMIN") {
    redirect("/login");
  }
  return { userId: session.user.id };
}

export async function getOptionalSession() {
  return auth();
}
