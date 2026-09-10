-- AlterTable
ALTER TABLE "LoginActivity" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sessionToken" TEXT;

-- CreateIndex
CREATE INDEX "LoginActivity_sessionToken_idx" ON "LoginActivity"("sessionToken");

-- CreateIndex
CREATE INDEX "LoginActivity_userId_deleted_idx" ON "LoginActivity"("userId", "deleted");
