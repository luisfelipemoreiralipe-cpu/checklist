import { prisma } from '../../../shared/config/database';

export class DashboardService {
  /**
   * Retorna métricas consolidadas para um tenant.
   * Cuidado com queries pesadas — use índices no banco.
   */
  async getOverview(tenantId: string, from?: string, to?: string) {
    const dateFilter = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };

    const hasDateFilter = from || to;

    // Todas queries paralelizadas para minimizar latência
    const [
      totalExecutions,
      completedExecutions,
      avgCompliance,
      criticalAlerts,
      totalAlerts,
      executionsByCategory,
      recentExecutions,
    ] = await Promise.all([
      // Total de execuções no período
      prisma.checklistExecution.count({
        where: {
          tenantId,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
      }),

      // Execuções completadas
      prisma.checklistExecution.count({
        where: {
          tenantId,
          status: 'COMPLETED',
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
      }),

      // Conformidade média
      prisma.checklistExecution.aggregate({
        where: {
          tenantId,
          status: 'COMPLETED',
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        _avg: { compliance: true },
      }),

      // Alertas críticos não resolvidos
      prisma.alert.count({
        where: { tenantId, severity: 'CRITICAL', resolved: false },
      }),

      // Total de alertas não resolvidos
      prisma.alert.count({
        where: { tenantId, resolved: false },
      }),

      // Execuções por categoria
      prisma.checklistExecution.groupBy({
        by: ['checklistId'],
        where: {
          tenantId,
          status: 'COMPLETED',
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        _count: { id: true },
        _avg: { compliance: true },
      }),

      // Últimas 5 execuções
      prisma.checklistExecution.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, name: true } },
          checklist: { select: { id: true, name: true, category: true } },
        },
      }),
    ]);

    const completionRate =
      totalExecutions > 0
        ? ((completedExecutions / totalExecutions) * 100).toFixed(1)
        : '0';

    return {
      summary: {
        totalExecutions,
        completedExecutions,
        completionRate: `${completionRate}%`,
        avgCompliance: (avgCompliance._avg.compliance ?? 0).toFixed(1) + '%',
        openAlerts: totalAlerts,
        criticalAlerts,
      },
      recentExecutions,
    };
  }

  /**
   * Histórico de conformidade por período (para gráficos).
   */
  async getComplianceHistory(tenantId: string, days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    // Raw query para agrupar por dia
    const history = await prisma.$queryRaw<
      { date: Date; avg_compliance: number; count: bigint }[]
    >`
      SELECT
        DATE_TRUNC('day', completed_at) AS date,
        AVG(compliance) AS avg_compliance,
        COUNT(*) AS count
      FROM checklist_executions
      WHERE
        tenant_id = ${tenantId}
        AND status = 'COMPLETED'
        AND completed_at >= ${from}
      GROUP BY DATE_TRUNC('day', completed_at)
      ORDER BY date ASC
    `;

    return history.map((row) => ({
      date: row.date,
      avgCompliance: Number(row.avg_compliance).toFixed(1),
      totalExecutions: Number(row.count),
    }));
  }

  /**
   * Falhas por checklist — identifica checklists problemáticos.
   */
  async getFailuresByChecklist(tenantId: string, limit = 10) {
    return prisma.checklistExecution.groupBy({
      by: ['checklistId'],
      where: {
        tenantId,
        status: 'COMPLETED',
        compliance: { lt: 70 }, // abaixo de 70% = falha
      },
      _count: { id: true },
      _avg: { compliance: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });
  }

  /**
   * Ranking de usuários com mais execuções e melhor conformidade.
   */
  async getUserRanking(tenantId: string, limit = 10) {
    return prisma.checklistExecution.groupBy({
      by: ['userId'],
      where: { tenantId, status: 'COMPLETED' },
      _count: { id: true },
      _avg: { compliance: true },
      orderBy: { _avg: { compliance: 'desc' } },
      take: limit,
    });
  }
}
