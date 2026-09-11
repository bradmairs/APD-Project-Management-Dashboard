// One-time fix for accounts created before POST /api/users started granting
// organization membership automatically: any user with role ADMIN who is
// missing membership in one or more organizations (so the org switcher never
// appeared, and /cmp was blocked) gets ADMIN membership backfilled here.
// Safe to re-run — every write is an upsert.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [admins, organizations] = await Promise.all([
    prisma.user.findMany({ where: { role: "ADMIN" } }),
    prisma.organization.findMany(),
  ]);

  if (organizations.length === 0) {
    console.log("No organizations found — nothing to backfill.");
    return;
  }

  let grantedCount = 0;
  for (const admin of admins) {
    for (const org of organizations) {
      const result = await prisma.organizationMembership.upsert({
        where: { userId_organizationId: { userId: admin.id, organizationId: org.id } },
        update: { role: "ADMIN" },
        create: { userId: admin.id, organizationId: org.id, role: "ADMIN" },
      });
      if (result.role === "ADMIN") grantedCount += 1;
    }
  }

  console.log(
    `Checked ${admins.length} admin(s) against ${organizations.length} organization(s); ${grantedCount} membership row(s) now in place.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
