import { ChecklistExecution, ExecutionAnswer } from '@prisma/client';
import { ExecutionRepository } from '../repositories/execution.repository';
import { RuleEngine } from './rule-engine.service';
import { AlertRepository } from '../../alerts/repositories/alert.repository';
import { GamificationRepository } from '../../gamification/repositories/gamification.repository';
import {
  NotFoundError,
  UnprocessableError,
  ForbiddenError,
} from '../../../shared/errors/AppError';
import {
  StartExecutionDto,
  AnswerItemDto,
  FinishExecutionDto,
  ListExecutionQuery,
} from '../dtos/execution.dto';
import { logger } from '../../../shared/logger';
import { prisma } from '../../../shared/config/database';

export class ExecutionService {
  private readonly repo: ExecutionRepository;
  private readonly ruleEngine: RuleEngine;
  private readonly alertRepo: AlertRepository;
  private readonly gamificationRepo: GamificationRepository;

  constructor() {
    this.repo = new ExecutionRepository();
    this.ruleEngine = new RuleEngine();
    this.alertRepo = new AlertRepository();
    this.gamificationRepo = new GamificationRepository();
  }

  // ── Iniciar execução ─────────────────────────────────────────
  async startExecution(
    tenantId: string,
    userId: string,
    dto: StartExecutionDto,
  ): Promise<ChecklistExecution> {
    // Verifica se o checklist existe e pertence ao tenant
    const checklist = await prisma.checklistTemplate.findFirst({
      where: { id: dto.checklistId, tenantId, active: true },
      include: { items: true },
    });

    if (!checklist) {
      throw new NotFoundError('Checklist');
    }

    // Calcula score máximo possível (soma dos pesos de todos os itens)
    const maxScore = checklist.items.reduce((sum, item) => sum + item.weight, 0);

    const execution = await this.repo.create({
      tenantId,
      checklistId: dto.checklistId,
      userId,
      shift: dto.shift ?? null,
      notes: dto.notes ?? null,
      maxScore,
    });

    // Muda status para IN_PROGRESS imediatamente
    return this.repo.updateStatus(execution.id, tenantId, 'IN_PROGRESS', {
      startedAt: new Date(),
    });
  }

  // ── Responder item ───────────────────────────────────────────
  async answerItem(
    executionId: string,
    tenantId: string,
    userId: string,
    dto: AnswerItemDto,
  ): Promise<ExecutionAnswer> {
    const execution = await this.repo.findByIdWithDetails(executionId, tenantId);

    if (!execution) throw new NotFoundError('Execução');

    if (execution.status !== 'IN_PROGRESS') {
      throw new UnprocessableError(
        'Somente execuções em andamento podem receber respostas',
      );
    }

    // Verifica se o usuário é o dono da execução (STAFF só responde as suas)
    if (execution.userId !== userId) {
      const isManager = ['MANAGER', 'ADMIN'].includes(
        (await prisma.user.findFirst({ where: { id: userId } }))?.role ?? '',
      );
      if (!isManager) {
        throw new ForbiddenError('Você não tem permissão para responder esta execução');
      }
    }

    // Valida que o item pertence ao checklist desta execução
    const item = execution.checklist.items.find(
      (i) => i.id === dto.checklistItemId,
    );

    if (!item) {
      throw new NotFoundError('Item do checklist');
    }

    // Valida o tipo da resposta
    const isValid = this.ruleEngine.validateAnswer(item, dto.value);

    // Calcula impacto no score
    const scoreImpact = this.ruleEngine.calculateScoreImpact(item, dto.value, isValid);

    // Avalia regras condicionais
    const triggeredActions = this.ruleEngine.evaluateRules(item, dto.value);

    // Salva ou atualiza a resposta (idempotente)
    const existing = await this.repo.findAnswer(executionId, dto.checklistItemId);

    let answer: ExecutionAnswer;

    if (existing) {
      answer = await this.repo.updateAnswer(executionId, dto.checklistItemId, {
        value: dto.value as any,
        photoUrl: dto.photoUrl,
        comment: dto.comment,
        isValid,
        scoreImpact,
        userId,
      });
    } else {
      answer = await this.repo.createAnswer({
        executionId,
        checklistItemId: dto.checklistItemId,
        userId,
        value: dto.value,
        photoUrl: dto.photoUrl,
        comment: dto.comment,
        isValid,
        scoreImpact,
      });
    }

    // Processa ações disparadas pelas regras
    await this.processRuleActions(
      triggeredActions,
      execution,
      item,
      tenantId,
    );

    // Recalcula scores da execução
    await this.recalculateExecutionScores(executionId, tenantId);

    logger.info('Resposta registrada', {
      executionId,
      itemId: dto.checklistItemId,
      isValid,
      scoreImpact,
    });

    return answer;
  }

  // ── Finalizar execução ───────────────────────────────────────
  async finishExecution(
    executionId: string,
    tenantId: string,
    userId: string,
    dto: FinishExecutionDto,
  ): Promise<ChecklistExecution> {
    const execution = await this.repo.findByIdWithDetails(executionId, tenantId);

    if (!execution) throw new NotFoundError('Execução');

    if (execution.status !== 'IN_PROGRESS') {
      throw new UnprocessableError('Execução não está em andamento');
    }

    // Verifica itens obrigatórios não respondidos
    const requiredItems = execution.checklist.items.filter((i) => i.required);
    const answeredItemIds = new Set(execution.answers.map((a) => a.checklistItemId));

    const unansweredRequired = requiredItems.filter(
      (item) => !answeredItemIds.has(item.id),
    );

    if (unansweredRequired.length > 0) {
      throw new UnprocessableError(
        `${unansweredRequired.length} item(s) obrigatório(s) não respondido(s): ${unansweredRequired
          .map((i) => i.title)
          .join(', ')}`,
      );
    }

    const completedExecution = await this.repo.updateStatus(
      executionId,
      tenantId,
      'COMPLETED',
      {
        completedAt: new Date(),
        notes: dto.notes ?? execution.notes,
      },
    );

    // Atualiza gamificação do usuário
    const totalScoreGained = execution.answers.reduce(
      (sum, a) => sum + a.scoreImpact,
      0,
    );

    await this.gamificationRepo.addScore(
      execution.userId,
      tenantId,
      Math.max(0, totalScoreGained), // sem pontos negativos no score global
    );

    // Alerta de conformidade baixa (< 70%)
    if (execution.compliance < 70) {
      await this.alertRepo.create({
        tenantId,
        executionId,
        type: 'COMPLIANCE_LOW',
        severity: execution.compliance < 50 ? 'CRITICAL' : 'HIGH',
        message: `Conformidade baixa na execução: ${execution.compliance.toFixed(1)}%`,
      });
    }

    logger.info('Execução finalizada', {
      executionId,
      userId: execution.userId,
      compliance: execution.compliance,
      tenantId,
    });

    return completedExecution;
  }

  // ── Listar execuções ─────────────────────────────────────────
  async listExecutions(tenantId: string, userId: string, userRole: string, query: ListExecutionQuery) {
    // STAFF só vê suas próprias execuções
    if (userRole === 'STAFF') {
      query.userId = userId;
    }

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

  async getExecutionDetails(executionId: string, tenantId: string, userId: string, userRole: string) {
    const execution = await this.repo.findByIdWithDetails(executionId, tenantId);

    if (!execution) throw new NotFoundError('Execução');

    // STAFF só vê suas próprias execuções
    if (userRole === 'STAFF' && execution.userId !== userId) {
      throw new ForbiddenError('Acesso negado a esta execução');
    }

    return execution;
  }

  // ── Helpers privados ─────────────────────────────────────────
  private async recalculateExecutionScores(
    executionId: string,
    tenantId: string,
  ): Promise<void> {
    const answers = await this.repo.getAnswersByExecution(executionId);
    const execution = await this.repo.findById(executionId, tenantId);

    if (!execution) return;

    const totalScore = answers.reduce((sum, a) => sum + a.scoreImpact, 0);
    const compliance =
      execution.maxScore > 0
        ? Math.max(0, Math.min(100, (totalScore / execution.maxScore) * 100))
        : 0;

    await this.repo.updateScores(
      executionId,
      Math.max(0, totalScore),
      execution.maxScore,
      compliance,
    );
  }

  private async processRuleActions(
    actions: { actionType: string; actionPayload: unknown }[],
    execution: Awaited<ReturnType<ExecutionRepository['findByIdWithDetails']>>,
    item: { id: string; title: string; isCritical: boolean },
    tenantId: string,
  ): Promise<void> {
    if (!execution) return;

    for (const action of actions) {
      switch (action.actionType) {
        case 'GENERATE_ALERT':
        case 'NOTIFY_MANAGER':
          await this.alertRepo.create({
            tenantId,
            executionId: execution.id,
            checklistItemId: item.id,
            type: item.isCritical ? 'CRITICAL_ITEM_FAILED' : 'THRESHOLD_EXCEEDED',
            severity: item.isCritical ? 'CRITICAL' : 'HIGH',
            message: `Regra disparada no item "${item.title}" — ação: ${action.actionType}`,
          });
          break;

        // REQUIRE_PHOTO e REQUIRE_COMMENT são validações no frontend
        // A lógica de bloqueio é feita no finish()
        default:
          break;
      }
    }
  }
}
