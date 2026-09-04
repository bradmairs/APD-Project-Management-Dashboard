import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.project.count();
  if (count > 0) {
    console.log("Projects already exist, skipping seed.");
    return;
  }

  await prisma.project.createMany({
    data: [
      {
        name: "Shepparton WRP Upgrade",
        description: "Capacity upgrade of the Shepparton Water Reclamation Plant.",
        assetType: "Treatment Plant",
        status: "CONSTRUCTION",
        projectManager: "A. Nguyen",
        location: "Shepparton",
        contractor: "Fulton Hogan",
        budget: 8500000,
        contractValue: 7920000,
        startDate: new Date("2025-02-10"),
        targetCompletionDate: new Date("2026-06-30"),
      },
      {
        name: "Mooroopna Trunk Main Renewal",
        description: "Replacement of aging trunk main along Midland Hwy.",
        assetType: "Pipeline",
        status: "TENDER",
        projectManager: "S. Patel",
        location: "Mooroopna",
        budget: 2100000,
        targetCompletionDate: new Date("2026-11-01"),
      },
      {
        name: "Nathalia Pump Station Refurbishment",
        description: "Refurbishment of sewage pump station 4.",
        assetType: "Pump Station",
        status: "DESIGN",
        projectManager: "A. Nguyen",
        location: "Nathalia",
        budget: 950000,
        targetCompletionDate: new Date("2027-02-15"),
      },
      {
        name: "Cobram Reservoir Roof Replacement",
        description: "Replace corroded reservoir roof structure.",
        assetType: "Reservoir",
        status: "DEFECTS_LIABILITY",
        projectManager: "J. Wilson",
        location: "Cobram",
        contractor: "BMD Constructions",
        budget: 1200000,
        contractValue: 1145000,
        startDate: new Date("2024-08-01"),
        targetCompletionDate: new Date("2025-05-01"),
        actualCompletionDate: new Date("2025-04-18"),
      },
      {
        name: "Tatura Office Building Refit",
        description: "Refit of depot office building for new crew facilities.",
        assetType: "Building",
        status: "PLANNING",
        projectManager: "S. Patel",
        location: "Tatura",
        budget: 480000,
      },
    ],
  });

  console.log("Seed data created.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
