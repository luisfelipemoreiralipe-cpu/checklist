import { Request, Response } from 'express';
import { GamificationService } from '../services/gamification.service';

export class GamificationController {
  private readonly service: GamificationService;

  constructor() {
    this.service = new GamificationService();
  }

  // GET /ranking
  getRanking = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = req.user;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await this.service.getRanking(tenantId, limit);

    res.status(200).json({ data });
  };

  // GET /me/score
  getMyScore = async (req: Request, res: Response): Promise<void> => {
    const { tenantId, sub: userId } = req.user;
    const data = await this.service.getMyScore(userId, tenantId);

    res.status(200).json({ data });
  };
}
