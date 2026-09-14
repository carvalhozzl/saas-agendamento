import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) redirect("/onboarding");

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true, onboardingDone: true },
  });
  if (!organization) redirect("/onboarding");
  if (!organization.onboardingDone) redirect("/onboarding");

  return (
    <div className="flex min-h-screen">
      <Sidebar organizationName={organization.name} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName={session.user.name} organizationName={organization.name} />
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
