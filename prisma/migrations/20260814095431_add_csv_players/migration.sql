-- CreateTable
CREATE TABLE "csv_players" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nation" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "squad" TEXT NOT NULL,
    "comp" TEXT NOT NULL,
    "age" DOUBLE PRECISION NOT NULL,
    "minutes" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "shots" INTEGER,
    "shots_on_target" INTEGER,
    "shots_on_target_percent" DOUBLE PRECISION,
    "goals_per_shot" DOUBLE PRECISION,
    "goals_per_shot_on_target" DOUBLE PRECISION,
    "season" TEXT NOT NULL DEFAULT '2025-2026',

    CONSTRAINT "csv_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_links" (
    "id" SERIAL NOT NULL,
    "api_football_id" INTEGER NOT NULL,
    "api_football_name" TEXT NOT NULL,
    "csv_player_id" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "csv_players_name_idx" ON "csv_players"("name");

-- CreateIndex
CREATE INDEX "csv_players_squad_idx" ON "csv_players"("squad");

-- CreateIndex
CREATE INDEX "csv_players_comp_idx" ON "csv_players"("comp");

-- CreateIndex
CREATE UNIQUE INDEX "player_links_api_football_id_key" ON "player_links"("api_football_id");

-- AddForeignKey
ALTER TABLE "player_links" ADD CONSTRAINT "player_links_csv_player_id_fkey" FOREIGN KEY ("csv_player_id") REFERENCES "csv_players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
