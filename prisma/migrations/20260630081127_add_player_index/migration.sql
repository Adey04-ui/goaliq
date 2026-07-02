-- CreateTable
CREATE TABLE "PlayerIndex" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "nationality" TEXT,
    "position" TEXT,
    "teamId" INTEGER,
    "teamName" TEXT,
    "teamLogo" TEXT,
    "leagueId" INTEGER,
    "season" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerIndex_name_idx" ON "PlayerIndex"("name");

-- CreateIndex
CREATE INDEX "PlayerIndex_teamId_idx" ON "PlayerIndex"("teamId");
