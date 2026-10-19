import { hash } from "bcryptjs";
import { getPrisma } from "../lib/prisma";

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
const name = process.argv[4]?.trim() || "Administrateur DC Boghni";

async function main() {
  if (!email || !password || password.length < 12) {
    console.error("Usage: npm run db:create-admin -- admin@example.com 'mot-de-passe-de-12-caracteres' 'Nom'");
    process.exitCode = 1;
    return;
  }

  const prisma = getPrisma();
  if (!prisma) {
    console.error("DATABASE_URL est manquante.");
    process.exitCode = 1;
    return;
  }

  try {
    const passwordHash = await hash(password, 12);
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash, name, role: "ADMIN" },
      create: { email, passwordHash, name, role: "ADMIN" }
    });

    console.log(`Administrateur créé ou mis à jour : ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Impossible de créer l’administrateur.", error);
  process.exitCode = 1;
});
