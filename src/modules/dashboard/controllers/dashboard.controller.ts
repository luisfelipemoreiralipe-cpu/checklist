import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private readonly service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  // GET /dashboard
  overview = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = req.user;
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await this.service.getOverview(tenantId, from, to);

    res.status(200).json({ data });
  };

  // GET /dashboard/compliance-history
  complianceHistory = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = req.user;
    const days = Number(req.query.days ?? 30);
    const data = await this.service.getComplianceHistory(tenantId, days);

    res.status(200).json({ data });
  };

  // GET /dashboard/failures
  failures = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = req.user;
    const limit = Number(req.query.limit ?? 10);
    const data = await this.service.getFailuresByChecklist(tenantId, limit);

    res.status(200).json({ data });
  };

  // GET /dashboard/user-ranking
  userRanking = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = req.user;
    const limit = Number(req.query.limit ?? 10);
    const data = await this.service.getUserRanking(tenantId, limit);

    res.status(200).json({ data });
  };
}
