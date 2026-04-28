import { AlertRepository } from '../repositories/alert.repository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { AlertSeverity } from '@prisma/client';

export class AlertService {
  private readonly repo: AlertRepository;

  constructor() {
    this.repo = new AlertRepository();
  }

  async listAlerts(
    tenantId: string,
    query: {
      resolved?: string;
      severity?: string;
      page: number;
      limit: number;
    },
  ) {
    const resolved =
      query.resolved !== undefined ? query.resolved === 'true' : undefined;
    const severity = query.severity as AlertSeverity | undefined;

    const { data, total } = await this.repo.findAll(tenantId, {
      resolved,
      severity,
      page: query.page,
      limit: query.limit,
    });

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async resolveAlert(alertId: string, tenantId: string, resolvedBy: string) {
    const alert = await this.repo.findById(alertId, tenantId);

    if (!alert) throw new NotFoundError('Alerta');

    if (alert.resolved) {
      return alert; // idempotente
    }

    return this.repo.resolve(alertId, tenantId, resolvedBy);
  }
}
