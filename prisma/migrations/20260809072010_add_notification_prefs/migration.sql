-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fullTimeScores" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "goalAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "halfTimeScores" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matchReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newsAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redCardAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "transferAlerts" BOOLEAN NOT NULL DEFAULT false;
