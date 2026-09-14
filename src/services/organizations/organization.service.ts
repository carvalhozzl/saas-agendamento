import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import type { BusinessSegment } from "@prisma/client";

const DEFAULT_HOURS = [
  { weekday: 1, startTime: "08:00", endTime: "18:00" },
  { weekday: 2, startTime: "08:00", endTime: "18:00" },
  { weekday: 3, startTime: "08:00", endTime: "18:00" },
  { weekday: 4, startTime: "08:00", endTime: "18:00" },
  { weekday: 5, startTime: "08:00", endTime: "18:00" },
  { weekday: 6, startTime: "08:00", endTime: "14:00" },
];

async function uniqueSlug(base: string) {
  const root = slugify(base) || "empresa";
  let candidate = root;
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    candidate = `${root}-${++i}`;
  }
  return candidate;
}

export async function signUpOwner({
  name,
  email,
  password,
  businessName,
}: {
  name: string;
  email: string;
  password: string;
  businessName: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Já existe uma conta com este e-mail.");

  const passwordHash = await bcrypt.hash(password, 10);
  const slug = await uniqueSlug(businessName);
  const basicPlan = await prisma.plan.findUnique({ where: { key: "basic" } });

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash },
    });

    const organization = await tx.organization.create({
      data: {
        name: businessName,
        slug,
        status: "TRIAL",
        workingHours: { create: DEFAULT_HOURS.map((h) => ({ ...h })) },
      },
    });

    await tx.membership.create({
      data: { userId: user.id, organizationId: organization.id, role: "OWNER" },
    });

    if (basicPlan) {
      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planId: basicPlan.id,
          status: "TRIALING",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return { user, organization };
  });
}

export async function completeOnboardingStep(organizationId: string, step: number) {
  return prisma.organization.update({
    where: { id: organizationId },
    data: {
      onboardingStep: step,
      onboardingDone: step >= 5,
    },
  });
}

export async function updateOrganizationProfile(
  organizationId: string,
  data: {
    name?: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    segment?: BusinessSegment;
  }
) {
  return prisma.organization.update({
    where: { id: organizationId },
    data,
  });
}
