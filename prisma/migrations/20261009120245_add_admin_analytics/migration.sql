-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL DEFAULT 'page_view',
    "path" TEXT NOT NULL,
    "country" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_visitorId_createdAt_idx" ON "analytics_events"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_userId_createdAt_idx" ON "analytics_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_country_createdAt_idx" ON "analytics_events"("country", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_path_createdAt_idx" ON "analytics_events"("path", "createdAt");
