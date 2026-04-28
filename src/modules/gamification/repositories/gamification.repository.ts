import { UserScore } from '@prisma/client';
import { prisma } from '../../../shared/config/database';

// Tabela de levels — ponto de corte por nível
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

function calculateLevel(score: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export class GamificationRepository {
  async addScore(userId: string, tenantId: string, points: number): Promise<UserScore> {
    // Upsert — cria ou incrementa o score
    const current = await prisma.userScore.upsert({
      where: { userId_tenantId: { userId, tenantId } },
      create: { userId, tenantId, score: points, level: calculateLevel(points) },
      update: {
        score: { increment: points },
      },
    });

    // Recalcula o level após incremento
    const newLevel = calculateLevel(current.score);
    if (newLevel !== current.level) {
      return prisma.userScore.update({
        where: { userId_tenantId: { userId, tenantId } },
        data: { level: newLevel },
      });
    }

    return current;
  }

  async getRanking(tenantId: string, limit = 10): Promise<UserScore[]> {
    return prisma.userScore.findMany({
      where: { tenantId },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getUserScore(userId: string, tenantId: string): Promise<UserScore | null> {
    return prisma.userScore.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  getLevelThresholds() {
    return LEVEL_THRESHOLDS.map((threshold, i) => ({
      level: i + 1,
      minScore: threshold,
      maxScore: LEVEL_THRESHOLDS[i + 1] ? LEVEL_THRESHOLDS[i + 1] - 1 : null,
    }));
  }
}
