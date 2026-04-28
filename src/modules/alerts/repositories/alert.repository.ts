import { Alert, AlertSeverity, AlertType } from '@prisma/client';
import { prisma } from '../../../shared/config/database';

export class AlertRepository {
  async create(data: {
    tenantId: string;
    executionId: string;
    checklistItemId?: string | null;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
  }): Promise<Alert> {
    return prisma.alert.create({ data });
  }

  async findAll(
    tenantId: string,
    options: {
      resolved?: boolean;
      severity?: AlertSeverity;
      page: number;
      limit: number;
    },
  ): Promise<{ data: Alert[]; total: number }> {
    const { resolved, severity, page, limit } = options;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(resolved !== undefined && { resolved }),
      ...(severity && { severity }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          execution: {
            select: {
              id: true,
              checklist: { select: { name: true } },
              user: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.alert.count({ where }),
    ]);

    return { data, total };
  }

  async resolve(id: string, tenantId: string, resolvedBy: string): Promise<Alert> {
    return prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<Alert | null> {
    return prisma.alert.findFirst({ where: { id, tenantId } });
  }
}
