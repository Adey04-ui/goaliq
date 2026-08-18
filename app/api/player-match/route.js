import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Try to find a CSV row that matches the API-Football player
export async function POST(req) {
  const { apiId, apiName, apiNationality, apiAge, apiTeam } = await req.json();

  // 1. Check if we already linked this player
  const existing = await prisma.playerLink.findUnique({
    where: { apiFootballId: apiId },
    include: { csvPlayer: true },
  });

  if (existing) {
    return Response.json({ found: true, csvPlayer: existing.csvPlayer, confidence: existing.confidence });
  }

  // 2. Search candidates from CSV
  const candidates = await prisma.csvPlayer.findMany({
    where: {
      OR: [
        { name: { contains: apiName.split(' ').pop(), mode: 'insensitive' } }, // last name
        { name: { startsWith: apiName.split(' ')[0], mode: 'insensitive' } },  // first name
      ],
    },
    take: 20, // limit for speed
  });

  // 3. Score each candidate
  let best = null;
  let bestScore = 0;

  for (const c of candidates) {
    let score = 0;
    
    // Name similarity
    const nameDist = levenshtein(normalize(apiName), normalize(c.name));
    score += Math.max(0, 100 - nameDist * 8);
    
    // Nationality
    if (apiNationality && c.nation.toLowerCase().includes(apiNationality.toLowerCase())) {
      score += 15;
    }
    
    // Age
    if (apiAge && Math.abs(apiAge - c.age) <= 1) {
      score += 10;
    }
    
    // Team
    if (apiTeam && normalize(apiTeam).includes(normalize(c.squad))) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  // 4. If confident enough, save the link forever
  if (best && bestScore >= 70) {
    const link = await prisma.playerLink.create({
      data: {
        apiFootballId: apiId,
        apiFootballName: apiName,
        csvPlayerId: best.id,
        confidence: Math.round(bestScore),
      },
      include: { csvPlayer: true },
    });
    
    return Response.json({ found: true, csvPlayer: best, confidence: bestScore, saved: true });
  }

  return Response.json({ found: false, bestMatch: best?.name, score: bestScore });
}

// Simple Levenshtein distance
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i-1] === a[j-1]
        ? matrix[i-1][j-1]
        : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}