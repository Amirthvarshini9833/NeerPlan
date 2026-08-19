-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'HOMEOWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "roofAreaSqFt" DOUBLE PRECISION NOT NULL,
    "roofType" TEXT NOT NULL,
    "annualRainfallMm" DOUBLE PRECISION NOT NULL,
    "occupants" INTEGER NOT NULL DEFAULT 1,
    "annualCollectionLitres" DOUBLE PRECISION NOT NULL,
    "suggestedTankLitres" INTEGER NOT NULL,
    "estimatedSavingsInr" DOUBLE PRECISION NOT NULL,
    "estimatedSetupCostInr" DOUBLE PRECISION NOT NULL,
    "paybackYears" DOUBLE PRECISION NOT NULL,
    "calculationVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InstallerLead" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "installerId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstallerLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "InstallerLead_installerId_status_idx" ON "InstallerLead"("installerId", "status");
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstallerLead" ADD CONSTRAINT "InstallerLead_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstallerLead" ADD CONSTRAINT "InstallerLead_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
