import { Request, Response } from 'express';
import { AlertService } from '../services/alert.service';

export class AlertController {
  private readonly service: AlertService;

  constructor() {
    this.service = new AlertService();
  }

  // GET /alerts
  list = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = req.user;
    const query = {
      resolved: req.query.resolved as string | undefined,
      severity: req.query.severity as string | undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    };
    const result = await this.service.listAlerts(tenantId, query);

    res.status(200).json(result);
  };

  // PATCH /alerts/:id/resolve
  resolve = async (req: Request, res: Response): Promise<void> => {
    const { tenantId, sub: userId } = req.user;
    const data = await this.service.resolveAlert(req.params['id'] as string, tenantId, userId);

    res.status(200).json({ message: 'Alerta resolvido', data });
  };
}
