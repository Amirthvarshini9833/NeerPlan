ALTER TABLE "Assessment"
  ADD COLUMN "areaSource" TEXT NOT NULL DEFAULT 'Manual user input',
  ADD COLUMN "areaDataSourceUrl" TEXT,
  ADD COLUMN "areaLocation" TEXT;
