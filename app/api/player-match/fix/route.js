import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  const { apiFootballId, correctCsvPlayerId } = await req.json();
  
  await prisma.playerLink.upsert({
    where: { apiFootballId },
    update: { csvPlayerId: correctCsvPlayerId, confidence: 100 },
    create: {
      apiFootballId,
      apiFootballName: 'Manual fix',
      csvPlayerId: correctCsvPlayerId,
      confidence: 100,
    },
  });
  
  return Response.json({ ok: true });
}