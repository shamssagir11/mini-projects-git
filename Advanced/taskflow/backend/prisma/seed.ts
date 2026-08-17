import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@taskflow.com" },
    update: {},
    create: { name: "Demo User", email: "demo@taskflow.com", passwordHash },
  });

  const board = await prisma.board.create({
    data: {
      title: "Product Launch Roadmap",
      description: "Everything needed to ship v1.0",
      members: { create: { userId: user.id, role: "OWNER" } },
      lists: {
        create: [
          {
            title: "Backlog",
            position: 0,
            cards: { create: [{ title: "Research competitors", position: 0, priority: "LOW" }] },
          },
          {
            title: "In Progress",
            position: 1,
            cards: { create: [{ title: "Build landing page", position: 0, priority: "HIGH" }] },
          },
          {
            title: "Done",
            position: 2,
            cards: { create: [{ title: "Set up CI/CD", position: 0, priority: "MEDIUM" }] },
          },
        ],
      },
    },
  });

  console.log(`Seeded demo user (demo@taskflow.com / password123) with board "${board.title}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
