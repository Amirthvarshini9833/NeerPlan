ALTER TABLE "Assessment" ADD COLUMN "state" TEXT NOT NULL DEFAULT 'Tamil Nadu';
ALTER TABLE "Assessment" ADD COLUMN "complianceStatus" TEXT NOT NULL DEFAULT 'PENDING_MUNICIPAL_CONFIRMATION';
ALTER TABLE "Assessment" ADD COLUMN "quoteCountRequested" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Assessment" ADD COLUMN "quoteRequestStatus" TEXT NOT NULL DEFAULT 'NOT_REQUESTED';
CREATE TABLE "InstallerQuote" ("id" TEXT NOT NULL,"leadId" TEXT NOT NULL,"installerId" TEXT NOT NULL,"systemType" TEXT NOT NULL,"tankLitres" INTEGER,"material" TEXT NOT NULL,"warrantyMonths" INTEGER NOT NULL,"priceInr" DOUBLE PRECISION NOT NULL,"installationDate" TIMESTAMP(3),"notes" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "InstallerQuote_pkey" PRIMARY KEY ("id"));
CREATE INDEX "InstallerQuote_leadId_priceInr_idx" ON "InstallerQuote"("leadId", "priceInr");
ALTER TABLE "InstallerQuote" ADD CONSTRAINT "InstallerQuote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "InstallerLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
