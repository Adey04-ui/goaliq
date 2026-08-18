import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';
import path from 'path';

const prisma = new PrismaClient();

// This builds the correct path no matter where you run the script from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, '..', 'players_data-2025_2026.csv');

async function importCsv() {
  const rows = [];

  // Read the CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Found ${rows.length} rows. Importing into Neon...`);

  // Insert in batches so Neon doesn't choke
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await prisma.csvPlayer.createMany({
      data: batch.map((row) => ({
        name: row.Player,
        nation: row.Nation,
        position: row.Pos,
        squad: row.Squad,
        comp: row.Comp,
        age: parseFloat(row.Age) || 0,
        minutes: parseInt(row.Min) || 0,
        goals: parseInt(row.Gls) || 0,
        assists: parseInt(row.Ast) || 0,
        shots: parseInt(row.Sh) || 0,
        shotsOnTarget: parseInt(row.SoT) || 0,
        shotsOnTargetPercent: parseFloat(row['SoT%']) || 0,
        goalsPerShot: parseFloat(row['G/Sh']) || 0,
        goalsPerShotOnTarget: parseFloat(row['G/SoT']) || 0,
        season: '2025-2026',
      })),
      skipDuplicates: false, // set true if you run it twice by accident
    });

    console.log(`  Imported ${Math.min(i + batchSize, rows.length)} / ${rows.length}`);
  }

  console.log('Done. All CSV rows are now in Neon.');
  await prisma.$disconnect();
}

importCsv().catch((e) => {
  console.error(e);
  process.exit(1);
});