-- CreateEnum
CREATE TYPE "FeeClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PAID');

-- CreateTable
CREATE TABLE "FeeClaim" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "stage" "DesignStageName",
    "periodEnding" TIMESTAMP(3),
    "claimedAmount" DECIMAL(14,2) NOT NULL,
    "approvedAmount" DECIMAL(14,2),
    "status" "FeeClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "dateSubmitted" TIMESTAMP(3),
    "dateApproved" TIMESTAMP(3),
    "datePaid" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmpMeetingMinutes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "meetingType" TEXT,
    "location" TEXT,
    "attendees" TEXT,
    "summary" TEXT,
    "nextMeetingDate" TIMESTAMP(3),
    "notes" TEXT,
    "recordedById" TEXT,
    "recordedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmpMeetingMinutes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeClaim_projectId_idx" ON "FeeClaim"("projectId");

-- CreateIndex
CREATE INDEX "CmpMeetingMinutes_projectId_idx" ON "CmpMeetingMinutes"("projectId");

-- AddForeignKey
ALTER TABLE "FeeClaim" ADD CONSTRAINT "FeeClaim_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CmpProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmpMeetingMinutes" ADD CONSTRAINT "CmpMeetingMinutes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CmpProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
