/*
  Warnings:

  - You are about to drop the column `goals_per_shot` on the `csv_players` table. All the data in the column will be lost.
  - You are about to drop the column `goals_per_shot_on_target` on the `csv_players` table. All the data in the column will be lost.
  - You are about to drop the column `shots_on_target_percent` on the `csv_players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "csv_players" DROP COLUMN "goals_per_shot",
DROP COLUMN "goals_per_shot_on_target",
DROP COLUMN "shots_on_target_percent",
ADD COLUMN     "born" INTEGER,
ADD COLUMN     "compl" INTEGER,
ADD COLUMN     "crdR" INTEGER,
ADD COLUMN     "crdY" INTEGER,
ADD COLUMN     "crs" INTEGER,
ADD COLUMN     "cs" INTEGER,
ADD COLUMN     "cs_pct" DOUBLE PRECISION,
ADD COLUMN     "fld" INTEGER,
ADD COLUMN     "fls" INTEGER,
ADD COLUMN     "g_a" INTEGER,
ADD COLUMN     "g_pk" INTEGER,
ADD COLUMN     "g_sh" DOUBLE PRECISION,
ADD COLUMN     "g_sot" DOUBLE PRECISION,
ADD COLUMN     "ga" INTEGER,
ADD COLUMN     "ga90" DOUBLE PRECISION,
ADD COLUMN     "int" INTEGER,
ADD COLUMN     "min_pct" DOUBLE PRECISION,
ADD COLUMN     "mn_mp" INTEGER,
ADD COLUMN     "mn_start" INTEGER,
ADD COLUMN     "mn_sub" INTEGER,
ADD COLUMN     "mp" INTEGER,
ADD COLUMN     "nineties" DOUBLE PRECISION,
ADD COLUMN     "off" INTEGER,
ADD COLUMN     "og" INTEGER,
ADD COLUMN     "onG" INTEGER,
ADD COLUMN     "onGa" INTEGER,
ADD COLUMN     "pk" INTEGER,
ADD COLUMN     "pkatt" INTEGER,
ADD COLUMN     "plus_minus" INTEGER,
ADD COLUMN     "plus_minus_90" DOUBLE PRECISION,
ADD COLUMN     "ppm" DOUBLE PRECISION,
ADD COLUMN     "save_pct" DOUBLE PRECISION,
ADD COLUMN     "saves" INTEGER,
ADD COLUMN     "sh_90" DOUBLE PRECISION,
ADD COLUMN     "sot_90" DOUBLE PRECISION,
ADD COLUMN     "sot_pct" DOUBLE PRECISION,
ADD COLUMN     "sota" INTEGER,
ADD COLUMN     "starts" INTEGER,
ADD COLUMN     "subs" INTEGER,
ADD COLUMN     "tkl_w" INTEGER,
ADD COLUMN     "unSub" INTEGER;
