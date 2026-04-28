import {
  ChecklistExecution,
  ExecutionAnswer,
  ChecklistItem,
  ExecutionStatus,
} from '@prisma/client';
import { prisma } from '../../../shared/config/database';
import { ListExecutionQuery } from '../dtos/execution.dto';

export class ExecutionRepository {
  // ── Execução ─────────────────────────────────────────────────
  async create(data: {
    tenantId: string;
    checklistId: string;
    userId: string;
    shift?: 'MORNING' | 'AFTERNOON' | 'NIGHT' | null;
    notes?: string | null;
    maxScore: number;
  }): Promise<ChecklistExecution> {
    return prisma.checklistExecution.create({
      data: {
        ...data,
        status: 'PENDING',
        totalScore: 0,
        compliance: 0,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<ChecklistExecution | null> {
    return prisma.checklistExecution.findFirst({
      where: { id, tenantId },
    });
  }

  async findByIdWithDetails(id: string, tenantId: string) {
    return prisma.checklistExecution.findFirst({
      where: { id, tenantId },
      include: {
        checklist: {
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: { rules: true },
            },
          },
        },
        answers: true,
        user: { select: { id: true, name: true, email: true } },
        alerts: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    query: ListExecutionQuery,
  ): Promise<{ data: ChecklistExecution[]; total: number }> {
    const { checklistId, userId, status, from, to, page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(checklistId && { checklistId }),
      ...(userId && { userId }),
      ...(status && { status: status as ExecutionStatus }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.checklistExecution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          checklist: { select: { id: true, name: true, category: true } },
          _count: { select: { answers: true, alerts: true } },
        },
      }),
      prisma.checklistExecution.count({ where }),
    ]);

    return { data, total };
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: ExecutionStatus,
    extra?: Partial<ChecklistExecution>,
  ): Promise<ChecklistExecution> {
    return prisma.checklistExecution.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  async updateScores(
    id: string,
    totalScore: number,
    maxScore: number,
    compliance: number,
  ): Promise<void> {
    await prisma.checklistExecution.update({
      where: { id },
      data: { totalScore, maxScore, compliance },
    });
  }

  // ── Respostas ────────────────────────────────────────────────
  async createAnswer(data: {
    executionId: string;
    checklistItemId: string;
    userId: string;
    value: unknown;
    photoUrl?: string | null;
    comment?: string | null;
    isValid: boolean;
    scoreImpact: number;
  }): Promise<ExecutionAnswer> {
    return prisma.executionAnswer.create({ data: data as any });
  }

  async findAnswer(
    executionId: string,
    checklistItemId: string,
  ): Promise<ExecutionAnswer | null> {
    return prisma.executionAnswer.findUnique({
      where: { executionId_checklistItemId: { executionId, checklistItemId } },
    });
  }

  async updateAnswer(
    executionId: string,
    checklistItemId: string,
    data: Partial<ExecutionAnswer>,
  ): Promise<ExecutionAnswer> {
    return prisma.executionAnswer.update({
      where: { executionId_checklistItemId: { executionId, checklistItemId } },
      data: data as any,
    });
  }

  async getAnswersByExecution(executionId: string): Promise<ExecutionAnswer[]> {
    return prisma.executionAnswer.findMany({ where: { executionId } });
  }

  // ── Checklist Items ───────────────────────────────────────────
  async getChecklistItems(checklistId: string): Promise<ChecklistItem[]> {
    return prisma.checklistItem.findMany({
      where: { checklistId },
      orderBy: { order: 'asc' },
      include: { rules: true },
    });
  }
}
