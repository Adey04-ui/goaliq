// lib/player-csv.js
import { prisma } from './prisma';

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function levenshtein(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b[i - 1] === a[j - 1]
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

export async function getCsvEnrichment(apiPlayer) {
  const apiId = apiPlayer.id;

  // 1. Already linked?
  const existing = await prisma.playerLink.findUnique({
    where: { apiFootballId: apiId },
    include: { csvPlayer: true },
  });

  if (existing) {
    const allRows = await prisma.csvPlayer.findMany({
      where: { name: existing.csvPlayer.name },
    });
    return { primary: existing.csvPlayer, allSeasonRows: allRows, confidence: existing.confidence };
  }

  // 2. Search candidates by last name or first name
  const parts = apiPlayer.name?.split(' ') || [];
  const lastName = parts.pop() || '';
  const firstName = parts[0] || '';

  const candidates = await prisma.csvPlayer.findMany({
    where: {
      OR: [
        { name: { contains: lastName, mode: 'insensitive' } },
        { name: { startsWith: firstName, mode: 'insensitive' } },
      ],
    },
    take: 30,
  });

  if (candidates.length === 0) return null;

  // 3. Score candidates
  const apiNorm = normalize(apiPlayer.name);
  const apiNat = normalize(apiPlayer.nationality || '');
  const apiAge = apiPlayer.age;

  let best = null;
  let bestScore = 0;

  for (const c of candidates) {
    let score = 0;
    const dist = levenshtein(apiNorm, normalize(c.name));
    score += Math.max(0, 100 - dist * 8);

    const csvNat = normalize(c.nation);
    if (apiNat && (csvNat.includes(apiNat) || apiNat.includes(csvNat))) score += 15;
    if (apiAge && Math.abs(apiAge - c.age) <= 1) score += 10;

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  // 4. Save link if confident enough
  if (best && bestScore >= 70) {
    await prisma.playerLink.create({
      data: {
        apiFootballId: apiId,
        apiFootballName: apiPlayer.name,
        csvPlayerId: best.id,
        confidence: Math.round(bestScore),
      },
    });

    const allRows = await prisma.csvPlayer.findMany({
      where: { name: best.name },
    });

    return { primary: best, allSeasonRows: allRows, confidence: bestScore, isNew: true };
  }

  return null;
}