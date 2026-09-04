import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const count = await prisma.project.count();
  if (count > 0) {
    console.log("Projects already exist, skipping seed.");
    return;
  }

  await prisma.project.create({
    data: {
      name: "Shepparton WRP Upgrade",
      description: "Capacity upgrade of the Shepparton Water Reclamation Plant.",
      assetType: "Treatment Plant",
      status: "CONSTRUCTION",
      projectManager: "A. Nguyen",
      location: "Shepparton",
      contractor: "Fulton Hogan",
      budget: 8500000,
      contractValue: 7920000,
      startDate: daysFromNow(-200),
      targetCompletionDate: daysFromNow(300),
      tasks: {
        create: [
          {
            title: "Complete civil works - clarifier upgrade",
            status: "DONE",
            dueDate: daysFromNow(-120),
          },
          {
            title: "Mechanical installation - blowers",
            status: "IN_PROGRESS",
            dueDate: daysFromNow(45),
          },
          {
            title: "Electrical & controls commissioning",
            status: "TODO",
            dueDate: daysFromNow(150),
          },
          {
            title: "Practical completion inspection",
            status: "TODO",
            dueDate: daysFromNow(300),
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Mooroopna Trunk Main Renewal",
      description: "Replacement of aging trunk main along Midland Hwy.",
      assetType: "Pipeline",
      status: "TENDER",
      projectManager: "S. Patel",
      location: "Mooroopna",
      budget: 2100000,
      targetCompletionDate: daysFromNow(400),
      tasks: {
        create: [
          {
            title: "Finalise tender documentation",
            status: "DONE",
            dueDate: daysFromNow(-60),
          },
          {
            title: "Evaluate tender submissions",
            status: "IN_PROGRESS",
            dueDate: daysFromNow(15),
          },
          {
            title: "Award contract",
            status: "TODO",
            dueDate: daysFromNow(35),
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Nathalia Pump Station Refurbishment",
      description: "Refurbishment of sewage pump station 4.",
      assetType: "Pump Station",
      status: "DESIGN",
      projectManager: "A. Nguyen",
      location: "Nathalia",
      budget: 950000,
      targetCompletionDate: daysFromNow(500),
      tasks: {
        create: [
          {
            title: "Concept design review",
            status: "DONE",
          },
          {
            title: "Detailed design - mechanical",
            status: "IN_PROGRESS",
            dueDate: daysFromNow(60),
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Cobram Reservoir Roof Replacement",
      description: "Replace corroded reservoir roof structure.",
      assetType: "Reservoir",
      status: "DEFECTS_LIABILITY",
      projectManager: "J. Wilson",
      location: "Cobram",
      contractor: "BMD Constructions",
      budget: 1200000,
      contractValue: 1145000,
      startDate: daysFromNow(-400),
      targetCompletionDate: daysFromNow(-120),
      actualCompletionDate: daysFromNow(-130),
      tasks: {
        create: [
          { title: "Practical completion", status: "DONE" },
          {
            title: "12-month defects inspection",
            status: "TODO",
            dueDate: daysFromNow(235),
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Tatura Office Building Refit",
      description: "Refit of depot office building for new crew facilities.",
      assetType: "Building",
      status: "PLANNING",
      projectManager: "S. Patel",
      location: "Tatura",
      budget: 480000,
    },
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
