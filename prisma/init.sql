PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'HOMEOWNER',
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Assessment (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  city TEXT NOT NULL,
  roofAreaSqFt REAL NOT NULL,
  areaSource TEXT NOT NULL DEFAULT 'Manual user input',
  areaDataSourceUrl TEXT,
  areaLocation TEXT,
  roofType TEXT NOT NULL,
  annualRainfallMm REAL NOT NULL,
  rainfallSource TEXT NOT NULL DEFAULT 'Manual user input',
  rainfallDataPeriod TEXT,
  rainfallRetrievedAt TEXT,
  occupants INTEGER NOT NULL DEFAULT 1,
  annualCollectionLitres REAL NOT NULL,
  suggestedTankLitres INTEGER NOT NULL,
  estimatedSavingsInr REAL NOT NULL,
  estimatedSetupCostInr REAL NOT NULL,
  paybackYears REAL NOT NULL,
  calculationVersion TEXT NOT NULL DEFAULT '1.0',
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS InstallerLead (
  id TEXT PRIMARY KEY NOT NULL,
  assessmentId TEXT NOT NULL,
  installerId TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessmentId) REFERENCES Assessment(id) ON DELETE CASCADE,
  FOREIGN KEY (installerId) REFERENCES User(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS InstallerLead_installerId_status_idx ON InstallerLead(installerId, status);
