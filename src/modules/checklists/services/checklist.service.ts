import { ChecklistTemplate, ChecklistItem, ItemRule, Prisma } from '@prisma/client';
import { ChecklistRepository } from '../repositories/checklist.repository';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError';
import {
  CreateChecklistDto,
  UpdateChecklistDto,
  ListChecklistQuery,
  CreateItemDto,
  UpdateItemDto,
  CreateRuleDto,
} from '../dtos/checklist.dto';
import { logger } from '../../../shared/logger';

export class ChecklistService {
  private readonly repo: ChecklistRepository;

  constructor() {
    this.repo = new ChecklistRepository();
  }

  // ── Templates ─────────────────────────────────────────────────
  async listChecklists(tenantId: string, query: ListChecklistQuery) {
    const { data, total } = await this.repo.findAll(tenantId, query);

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

  async getChecklistById(id: string, tenantId: string) {
    const checklist = await this.repo.findById(id, tenantId);

    if (!checklist) {
      throw new NotFoundError('Checklist');
    }

    return checklist;
  }

  async createChecklist(
    tenantId: string,
    dto: CreateChecklistDto,
  ): Promise<ChecklistTemplate> {
    const checklist = await this.repo.create(tenantId, {
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category,
      frequency: dto.frequency,
      active: true,
    });

    logger.info('Checklist criado', { checklistId: checklist.id, tenantId });

    return checklist;
  }

  async updateChecklist(
    id: string,
    tenantId: string,
    dto: UpdateChecklistDto,
  ): Promise<ChecklistTemplate> {
    await this.assertChecklistBelongsToTenant(id, tenantId);

    return this.repo.update(id, tenantId, dto);
  }

  async deleteChecklist(id: string, tenantId: string): Promise<void> {
    await this.assertChecklistBelongsToTenant(id, tenantId);

    await this.repo.delete(id, tenantId);

    logger.info('Checklist desativado (soft delete)', { checklistId: id, tenantId });
  }

  // ── Items ────────────────────────────────────────────────────
  async addItem(
    checklistId: string,
    tenantId: string,
    dto: CreateItemDto,
  ): Promise<ChecklistItem> {
    await this.assertChecklistBelongsToTenant(checklistId, tenantId);

    return this.repo.createItem(checklistId, {
      title: dto.title,
      description: dto.description ?? null,
      type: dto.type,
      required: dto.required,
      weight: dto.weight,
      isCritical: dto.isCritical,
      order: dto.order,
    });
  }

  async updateItem(
    itemId: string,
    tenantId: string,
    dto: UpdateItemDto,
  ): Promise<ChecklistItem> {
    const item = await this.repo.findItemById(itemId);

    if (!item) throw new NotFoundError('Item');

    if (item.checklist.tenantId !== tenantId) {
      throw new ForbiddenError('Item não pertence a este tenant');
    }

    return this.repo.updateItem(itemId, item.checklistId, dto);
  }

  async deleteItem(itemId: string, tenantId: string): Promise<void> {
    const item = await this.repo.findItemById(itemId);

    if (!item) throw new NotFoundError('Item');

    if (item.checklist.tenantId !== tenantId) {
      throw new ForbiddenError('Item não pertence a este tenant');
    }

    await this.repo.deleteItem(itemId, item.checklistId);
  }

  // ── Regras ───────────────────────────────────────────────────
  async addRule(
    itemId: string,
    tenantId: string,
    dto: CreateRuleDto,
  ): Promise<ItemRule> {
    const item = await this.repo.findItemById(itemId);

    if (!item) throw new NotFoundError('Item');

    if (item.checklist.tenantId !== tenantId) {
      throw new ForbiddenError('Item não pertence a este tenant');
    }

    return this.repo.createRule(itemId, {
      conditionType: dto.conditionType,
      conditionValue: dto.conditionValue,
      actionType: dto.actionType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actionPayload: (dto.actionPayload ?? Prisma.JsonNull) as any,
    });
  }

  // ── Guards privados ──────────────────────────────────────────
  private async assertChecklistBelongsToTenant(
    checklistId: string,
    tenantId: string,
  ): Promise<void> {
    const exists = await this.repo.exists(checklistId, tenantId);

    if (!exists) {
      throw new NotFoundError('Checklist');
    }
  }
}
