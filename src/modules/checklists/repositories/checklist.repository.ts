import {
  ChecklistTemplate,
  ChecklistItem,
  ItemRule,
  ChecklistCategory,
  ChecklistFrequency,
  Prisma,
} from '@prisma/client';
import { prisma } from '../../../shared/config/database';
import { ListChecklistQuery } from '../dtos/checklist.dto';

type ChecklistWithItems = ChecklistTemplate & {
  items: (ChecklistItem & { rules: ItemRule[] })[];
  _count: { executions: number };
};

export class ChecklistRepository {
  // ── Templates ─────────────────────────────────────────────────
  async findAll(
    tenantId: string,
    query: ListChecklistQuery,
  ): Promise<{ data: ChecklistTemplate[]; total: number }> {
    const { category, frequency, active, page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(category && { category: category as ChecklistCategory }),
      ...(frequency && { frequency: frequency as ChecklistFrequency }),
      ...(active !== undefined && { active }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.checklistTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true, executions: true } } },
      }),
      prisma.checklistTemplate.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string): Promise<ChecklistWithItems | null> {
    return prisma.checklistTemplate.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { rules: true },
        },
        _count: { select: { executions: true } },
      },
    }) as Promise<ChecklistWithItems | null>;
  }

  async create(
    tenantId: string,
    data: Omit<ChecklistTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<ChecklistTemplate> {
    return prisma.checklistTemplate.create({
      data: { ...data, tenantId },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<ChecklistTemplate>,
  ): Promise<ChecklistTemplate> {
    return prisma.checklistTemplate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    // Soft delete — mantém histórico de execuções
    await prisma.checklistTemplate.update({
      where: { id },
      data: { active: false },
    });
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await prisma.checklistTemplate.count({
      where: { id, tenantId },
    });
    return count > 0;
  }

  // ── Items ─────────────────────────────────────────────────────
  async createItem(
    checklistId: string,
    data: Omit<ChecklistItem, 'id' | 'checklistId' | 'createdAt' | 'updatedAt'>,
  ): Promise<ChecklistItem> {
    return prisma.checklistItem.create({
      data: { ...data, checklistId },
    });
  }

  async updateItem(
    id: string,
    checklistId: string,
    data: Partial<ChecklistItem>,
  ): Promise<ChecklistItem> {
    return prisma.checklistItem.update({
      where: { id },
      data,
    });
  }

  async deleteItem(id: string, checklistId: string): Promise<void> {
    await prisma.checklistItem.delete({ where: { id } });
  }

  async findItemById(id: string): Promise<(ChecklistItem & { checklist: ChecklistTemplate }) | null> {
    return prisma.checklistItem.findFirst({
      where: { id },
      include: { checklist: true },
    });
  }

  // ── Rules ────────────────────────────────────────────────────
  async createRule(
    checklistItemId: string,
    data: Omit<ItemRule, 'id' | 'checklistItemId' | 'createdAt'>,
  ): Promise<ItemRule> {
    return prisma.itemRule.create({
      data: {
        checklistItemId,
        conditionType: data.conditionType,
        conditionValue: data.conditionValue,
        actionType: data.actionType,
        actionPayload: data.actionPayload ? (data.actionPayload as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }
}
