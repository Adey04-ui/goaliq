-- CreateTable
CREATE TABLE "api_request_logs" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "userAgent" TEXT,
    "errorType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_request_logs_createdAt_idx" ON "api_request_logs"("createdAt");

-- CreateIndex
CREATE INDEX "api_request_logs_path_createdAt_idx" ON "api_request_logs"("path", "createdAt");

-- CreateIndex
CREATE INDEX "api_request_logs_statusCode_createdAt_idx" ON "api_request_logs"("statusCode", "createdAt");

-- CreateIndex
CREATE INDEX "api_request_logs_ipAddress_createdAt_idx" ON "api_request_logs"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "api_request_logs_visitorId_createdAt_idx" ON "api_request_logs"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "api_request_logs_userId_createdAt_idx" ON "api_request_logs"("userId", "createdAt");
