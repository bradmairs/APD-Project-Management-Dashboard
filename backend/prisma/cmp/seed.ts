import { PrismaClient } from "../../src/generated/cmp-client";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const count = await prisma.cmpProject.count();
  if (count > 0) {
    console.log("CMP projects already exist, skipping seed.");
    return;
  }

  await prisma.cmpProject.create({
    data: {
      name: "Benalla Water Treatment Plant Upgrade - Design",
      clientName: "North East Water",
      projectNumber: "CMP-2401",
      description: "Detailed design for a capacity upgrade of the Benalla WTP.",
      discipline: "Civil / Mechanical",
      status: "ACTIVE",
      projectLead: "R. Chen",
      feeBudget: 420000,
      hoursBudget: 2400,
      startDate: daysFromNow(-90),
      targetIssueDate: daysFromNow(60),
      createdByName: "Admin",
      designStages: {
        create: [
          {
            stage: "CONCEPT_DESIGN",
            status: "COMPLETE",
            percentComplete: 100,
            targetDate: daysFromNow(-60),
            actualDate: daysFromNow(-58),
            feeAllocated: 40000,
            hoursAllocated: 240,
            hoursSpent: 230,
            sortOrder: 0,
          },
          {
            stage: "PRELIMINARY_DESIGN",
            status: "COMPLETE",
            percentComplete: 100,
            targetDate: daysFromNow(-20),
            actualDate: daysFromNow(-15),
            feeAllocated: 90000,
            hoursAllocated: 520,
            hoursSpent: 540,
            sortOrder: 1,
          },
          {
            stage: "DETAILED_DESIGN",
            status: "IN_PROGRESS",
            percentComplete: 55,
            targetDate: daysFromNow(30),
            feeAllocated: 210000,
            hoursAllocated: 1200,
            hoursSpent: 610,
            sortOrder: 2,
          },
          {
            stage: "TENDER_DOCUMENTATION",
            status: "NOT_STARTED",
            percentComplete: 0,
            targetDate: daysFromNow(60),
            feeAllocated: 80000,
            hoursAllocated: 440,
            sortOrder: 3,
          },
        ],
      },
      drawings: {
        create: [
          {
            drawingNumber: "CMP-2401-C-001",
            title: "Site Layout Plan",
            discipline: "Civil",
            currentRevision: "B",
            status: "ISSUED_FOR_REVIEW",
            revisions: {
              create: [
                {
                  revision: "A",
                  description: "Initial concept issue",
                  issuedFor: "Concept Review",
                  issuedByName: "R. Chen",
                  issuedDate: daysFromNow(-58),
                },
                {
                  revision: "B",
                  description: "Updated after client comments",
                  issuedFor: "Preliminary Review",
                  issuedByName: "R. Chen",
                  issuedDate: daysFromNow(-14),
                },
              ],
            },
          },
          {
            drawingNumber: "CMP-2401-M-101",
            title: "Clarifier Mechanical Layout",
            discipline: "Mechanical",
            currentRevision: "A",
            status: "DRAFT",
            revisions: {
              create: [
                {
                  revision: "A",
                  description: "First draft for internal review",
                  issuedFor: "Internal QA",
                  issuedByName: "T. Osei",
                  issuedDate: daysFromNow(-5),
                },
              ],
            },
          },
        ],
      },
      designReviews: {
        create: [
          {
            stage: "PRELIMINARY_DESIGN",
            reviewDate: daysFromNow(-16),
            reviewerName: "M. Farrell",
            outcome: "APPROVED_WITH_COMMENTS",
            comments: "Confirm pump duty points before detailed design proceeds.",
            createdByName: "Admin",
          },
        ],
      },
      feeClaims: {
        create: [
          {
            claimNumber: "FC-01",
            stage: "CONCEPT_DESIGN",
            periodEnding: daysFromNow(-58),
            claimedAmount: 40000,
            approvedAmount: 40000,
            status: "PAID",
            dateSubmitted: daysFromNow(-56),
            dateApproved: daysFromNow(-50),
            datePaid: daysFromNow(-20),
            createdByName: "R. Chen",
          },
          {
            claimNumber: "FC-02",
            stage: "PRELIMINARY_DESIGN",
            periodEnding: daysFromNow(-15),
            claimedAmount: 90000,
            approvedAmount: 85000,
            status: "APPROVED",
            dateSubmitted: daysFromNow(-13),
            dateApproved: daysFromNow(-5),
            notes: "Client queried 5k of survey coordination time; agreed reduction.",
            createdByName: "R. Chen",
          },
          {
            claimNumber: "FC-03",
            stage: "DETAILED_DESIGN",
            periodEnding: daysFromNow(-2),
            claimedAmount: 105000,
            status: "SUBMITTED",
            dateSubmitted: daysFromNow(-2),
            createdByName: "R. Chen",
          },
        ],
      },
      meetingMinutes: {
        create: [
          {
            meetingDate: daysFromNow(-15),
            meetingType: "Design Review",
            location: "North East Water offices, Wangaratta",
            attendees: "R. Chen (CMP), M. Farrell (NEW), T. Osei (CMP)",
            summary:
              "Reviewed preliminary design. Client requested confirmation of pump duty points before detailed design proceeds.",
            nextMeetingDate: daysFromNow(20),
            recordedByName: "R. Chen",
          },
        ],
      },
    },
  });

  await prisma.cmpProject.create({
    data: {
      name: "Yarrawonga Pipeline Duplication - Concept Design",
      clientName: "Goulburn-Murray Water",
      projectNumber: "CMP-2409",
      description: "Concept design options for duplicating the Yarrawonga trunk main.",
      discipline: "Civil",
      status: "PROPOSAL",
      projectLead: "T. Osei",
      feeBudget: 65000,
      hoursBudget: 380,
      startDate: daysFromNow(10),
      targetIssueDate: daysFromNow(90),
      createdByName: "Admin",
      designStages: {
        create: [
          {
            stage: "CONCEPT_DESIGN",
            status: "NOT_STARTED",
            percentComplete: 0,
            targetDate: daysFromNow(90),
            feeAllocated: 65000,
            hoursAllocated: 380,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  console.log("CMP seed data created.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
