import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';
import path from 'path';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, '..', 'players_data-2025_2026.csv');

function parseIntOrNull(val) {
  const n = parseInt(val);
  return isNaN(n) ? null : n;
}

function parseFloatOrNull(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

async function reimport() {
  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Found ${rows.length} rows. Clearing old data...`);

  // Delete links first (foreign key constraint), then players
  await prisma.playerLink.deleteMany({});
  await prisma.csvPlayer.deleteMany({});

  console.log('Importing with full stats...');

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
        age: parseFloatOrNull(row.Age) ?? 0,
        born: parseIntOrNull(row.Born),

        mp: parseIntOrNull(row.MP),
        starts: parseIntOrNull(row.Starts),
        minutes: parseIntOrNull(row.Min) ?? 0,
        n90s: parseFloatOrNull(row['90s']),
        goals: parseIntOrNull(row.Gls) ?? 0,
        assists: parseIntOrNull(row.Ast) ?? 0,
        gA: parseIntOrNull(row['G+A']),
        gPk: parseIntOrNull(row['G-PK']),
        pk: parseIntOrNull(row.PK),
        pkatt: parseIntOrNull(row.PKatt),
        crdY: parseIntOrNull(row.CrdY),
        crdR: parseIntOrNull(row.CrdR),

        ga: parseIntOrNull(row.GA),
        ga90: parseFloatOrNull(row['GA90']),
        sota: parseIntOrNull(row.SoTA),
        saves: parseIntOrNull(row.Saves),
        savePct: parseFloatOrNull(row['Save%']),
        cs: parseIntOrNull(row.CS),
        csPct: parseFloatOrNull(row['CS%']),

        shots: parseIntOrNull(row.Sh),
        shotsOnTarget: parseIntOrNull(row.SoT),
        sotPct: parseFloatOrNull(row['SoT%']),
        sh90: parseFloatOrNull(row['Sh/90']),
        sot90: parseFloatOrNull(row['SoT/90']),
        gSh: parseFloatOrNull(row['G/Sh']),
        gSot: parseFloatOrNull(row['G/SoT']),

        mnMp: parseIntOrNull(row['Mn/MP']),
        minPct: parseFloatOrNull(row['Min%']),
        mnStart: parseIntOrNull(row['Mn/Start']),
        compl: parseIntOrNull(row.Compl),
        subs: parseIntOrNull(row.Subs),
        mnSub: parseIntOrNull(row['Mn/Sub']),
        unSub: parseIntOrNull(row['unSub']),
        ppm: parseFloatOrNull(row.PPM),
        onG: parseIntOrNull(row['onG']),
        onGa: parseIntOrNull(row['onGA']),
        plusMinus: parseIntOrNull(row['+/-']),
        plusMinus90: parseFloatOrNull(row['+/-90']),

        fls: parseIntOrNull(row.Fls),
        fld: parseIntOrNull(row.Fld),
        off: parseIntOrNull(row.Off),
        crs: parseIntOrNull(row.Crs),
        int: parseIntOrNull(row.Int),
        tklW: parseIntOrNull(row.TklW),
        og: parseIntOrNull(row.OG),

        season: '2025-2026',
      })),
      skipDuplicates: true,
    });

    console.log(`  Imported ${Math.min(i + batchSize, rows.length)} / ${rows.length}`);
  }

  console.log('Done. All CSV rows re-imported with full stats.');
  await prisma.$disconnect();
}

reimport().catch((e) => {
  console.error(e);
  process.exit(1);
});