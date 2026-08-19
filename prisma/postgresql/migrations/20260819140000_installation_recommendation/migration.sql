ALTER TABLE "Assessment"
  ADD COLUMN "buildingType" TEXT NOT NULL DEFAULT 'independent_house',
  ADD COLUMN "availableSpace" TEXT NOT NULL DEFAULT 'moderate',
  ADD COLUMN "recommendationJson" TEXT;
