import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { key: "basic" },
    update: {},
    create: {
      key: "basic",
      name: "Básico",
      priceCents: 4990,
      maxProfessionals: 1,
      features: ["Agenda", "Clientes", "Serviços"],
    },
  });

  await prisma.plan.upsert({
    where: { key: "professional" },
    update: {},
    create: {
      key: "professional",
      name: "Profissional",
      priceCents: 9990,
      maxProfessionals: 5,
      features: [
        "Agenda",
        "Clientes",
        "Serviços",
        "Página de agendamento",
        "Lembretes",
        "Relatórios",
      ],
    },
  });

  await prisma.plan.upsert({
    where: { key: "business" },
    update: {},
    create: {
      key: "business",
      name: "Empresa",
      priceCents: 19990,
      maxProfessionals: null,
      features: [
        "Profissionais ilimitados",
        "Todos os recursos",
        "Relatórios avançados",
        "Recursos premium",
      ],
    },
  });

  const superAdminEmail = "admin@agendapro.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: superAdminEmail,
        passwordHash: await bcrypt.hash("admin12345", 10),
        platformRole: "SUPER_ADMIN",
      },
    });
    console.log(`Super admin criado: ${superAdminEmail} / admin12345`);
  }

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
