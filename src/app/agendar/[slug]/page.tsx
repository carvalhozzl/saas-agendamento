import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SEGMENT_LABELS } from "@/lib/segments";
import { BookingWizard } from "./booking-wizard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const organization = await prisma.organization.findUnique({ where: { slug } });
  if (!organization) return { title: "Página não encontrada" };
  return {
    title: `Agendar em ${organization.name}`,
    description: organization.description ?? `Agende seu horário em ${organization.name} pela AgendaPro.`,
  };
}

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      services: { where: { status: "ACTIVE" }, orderBy: { name: "asc" } },
      professionals: {
        where: { status: "ACTIVE" },
        include: { services: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!organization || organization.status === "SUSPENDED" || organization.status === "CANCELLED") {
    notFound();
  }

  const serviceProfessionalMap: Record<string, string[]> = {};
  for (const professional of organization.professionals) {
    for (const link of professional.services) {
      serviceProfessionalMap[link.serviceId] ??= [];
      serviceProfessionalMap[link.serviceId].push(professional.id);
    }
  }

  return (
    <div className="min-h-screen bg-muted-surface">
      <header className="bg-surface border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          {organization.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={organization.logoUrl} alt={organization.name} className="h-16 w-16 rounded-xl mx-auto mb-3 object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-brand mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-semibold text-foreground">{organization.name}</h1>
          <p className="text-sm text-muted mt-1">{SEGMENT_LABELS[organization.segment]}</p>
          {organization.description && <p className="text-sm text-muted mt-2">{organization.description}</p>}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <BookingWizard
          organizationSlug={organization.slug}
          services={organization.services}
          professionals={organization.professionals}
          serviceProfessionalMap={serviceProfessionalMap}
        />
      </main>
    </div>
  );
}
