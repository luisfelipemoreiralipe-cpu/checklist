import { GamificationRepository } from '../repositories/gamification.repository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GamificationService {
  private readonly repo: GamificationRepository;

  constructor() {
    this.repo = new GamificationRepository();
  }

  async getRanking(tenantId: string, limit?: number) {
    const ranking = await this.repo.getRanking(tenantId, limit);
    const levels = this.repo.getLevelThresholds();

    return {
      ranking: ranking.map((entry, index) => ({
        position: index + 1,
        ...entry,
        nextLevelPoints: levels.find((l) => l.level === entry.level + 1)?.minScore ?? null,
      })),
      levels,
    };
  }

  async getMyScore(userId: string, tenantId: string) {
    const score = await this.repo.getUserScore(userId, tenantId);

    if (!score) {
      // Usuário ainda não tem score
      return {
        userId,
        tenantId,
        score: 0,
        level: 1,
        nextLevelPoints: 100,
        levelThresholds: this.repo.getLevelThresholds(),
      };
    }

    const levels = this.repo.getLevelThresholds();
    const nextLevel = levels.find((l) => l.level === score.level + 1);

    return {
      ...score,
      nextLevelPoints: nextLevel?.minScore ?? null,
      levelThresholds: levels,
    };
  }
}
