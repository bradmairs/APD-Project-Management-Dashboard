-- CreateEnum
CREATE TYPE "CmpProjectStatus" AS ENUM ('ENQUIRY', 'PROPOSAL', 'ACTIVE', 'ON_HOLD', 'COMPLETE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DesignStageName" AS ENUM ('CONCEPT_DESIGN', 'PRELIMINARY_DESIGN', 'DETAILED_DESIGN', 'TENDER_DOCUMENTATION', 'CONSTRUCTION_ISSUE', 'AS_BUILT');

-- CreateEnum
CREATE TYPE "DesignStageStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ISSUED_FOR_REVIEW', 'APPROVED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "DrawingStatus" AS ENUM ('DRAFT', 'ISSUED_FOR_REVIEW', 'ISSUED_FOR_CONSTRUCTION', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "DesignReviewOutcome" AS ENUM ('APPROVED', 'APPROVED_WITH_COMMENTS', 'REJECTED');

-- CreateTable
CREATE TABLE "CmpProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "projectNumber" TEXT,
    "description" TEXT,
    "discipline" TEXT,
    "status" "CmpProjectStatus" NOT NULL DEFAULT 'ENQUIRY',
    "projectLead" TEXT,
    "feeBudget" DECIMAL(14,2),
    "hoursBudget" INTEGER,
    "startDate" TIMESTAMP(3),
    "targetIssueDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmpProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignStage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stage" "DesignStageName" NOT NULL,
    "status" "DesignStageStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "feeAllocated" DECIMAL(14,2),
    "hoursAllocated" INTEGER,
    "hoursSpent" INTEGER,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drawing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "drawingNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "discipline" TEXT,
    "currentRevision" TEXT,
    "status" "DrawingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drawing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawingRevision" (
    "id" TEXT NOT NULL,
    "drawingId" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "description" TEXT,
    "issuedFor" TEXT,
    "issuedById" TEXT,
    "issuedByName" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrawingRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignReview" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stage" "DesignStageName",
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "outcome" "DesignReviewOutcome" NOT NULL,
    "comments" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmpActivityLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "projectName" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmpActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignStage_projectId_idx" ON "DesignStage"("projectId");

-- CreateIndex
CREATE INDEX "Drawing_projectId_idx" ON "Drawing"("projectId");

-- CreateIndex
CREATE INDEX "DrawingRevision_drawingId_idx" ON "DrawingRevision"("drawingId");

-- CreateIndex
CREATE INDEX "DesignReview_projectId_idx" ON "DesignReview"("projectId");

-- CreateIndex
CREATE INDEX "CmpActivityLog_projectId_idx" ON "CmpActivityLog"("projectId");

-- CreateIndex
CREATE INDEX "CmpActivityLog_createdAt_idx" ON "CmpActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "DesignStage" ADD CONSTRAINT "DesignStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CmpProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drawing" ADD CONSTRAINT "Drawing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CmpProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawingRevision" ADD CONSTRAINT "DrawingRevision_drawingId_fkey" FOREIGN KEY ("drawingId") REFERENCES "Drawing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CmpProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmpActivityLog" ADD CONSTRAINT "CmpActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CmpProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
