-- AlterTable
ALTER TABLE "analytics_events" ADD COLUMN     "columnNumber" INTEGER,
ADD COLUMN     "lineNumber" INTEGER,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "metricName" TEXT,
ADD COLUMN     "metricRating" TEXT,
ADD COLUMN     "metricValue" DOUBLE PRECISION,
ADD COLUMN     "resourceName" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "stack" TEXT,
ADD COLUMN     "statusCode" INTEGER,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "analytics_events_eventType_createdAt_idx" ON "analytics_events"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_metricName_createdAt_idx" ON "analytics_events"("metricName", "createdAt");
