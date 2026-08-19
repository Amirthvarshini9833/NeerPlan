ALTER TABLE "Assessment"
  ADD COLUMN "rainfallSource" TEXT NOT NULL DEFAULT 'Manual user input',
  ADD COLUMN "rainfallDataPeriod" TEXT,
  ADD COLUMN "rainfallRetrievedAt" TIMESTAMP(3);
