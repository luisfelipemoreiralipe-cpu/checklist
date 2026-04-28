import { ChecklistItem, ItemRule } from '@prisma/client';

type ItemWithRules = ChecklistItem & { rules: ItemRule[] };

type ConditionType =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL'
  | 'CONTAINS';

/**
 * Motor de regras — avalia condicionais dos itens do checklist.
 * Isolado como serviço de domínio puro (sem dependências externas).
 */
export class RuleEngine {
  /**
   * Avalia todas as regras de um item dado um valor de resposta.
   * Retorna as ações que devem ser executadas.
   */
  evaluateRules(
    item: ItemWithRules,
    value: unknown,
  ): { actionType: string; actionPayload: unknown }[] {
    const triggeredActions: { actionType: string; actionPayload: unknown }[] = [];

    for (const rule of item.rules) {
      if (this.evaluateCondition(rule, value)) {
        triggeredActions.push({
          actionType: rule.actionType,
          actionPayload: rule.actionPayload,
        });
      }
    }

    return triggeredActions;
  }

  /**
   * Calcula o impacto de score de uma resposta.
   * Retorna positivo (acerto) ou negativo (erro em crítico).
   */
  calculateScoreImpact(item: ChecklistItem, value: unknown, isValid: boolean): number {
    if (!isValid) {
      // Itens críticos têm penalidade maior ao falhar
      return item.isCritical ? -(item.weight * 2) : -item.weight;
    }

    return item.weight;
  }

  /**
   * Valida se uma resposta é válida baseado no tipo do item.
   */
  validateAnswer(item: ChecklistItem, value: unknown): boolean {
    switch (item.type) {
      case 'BOOLEAN':
        return typeof value === 'boolean';

      case 'NUMBER': {
        const num = Number(value);
        return !isNaN(num);
      }

      case 'TEXT':
        return typeof value === 'string' && value.trim().length > 0;

      case 'PHOTO':
        return typeof value === 'string' && value.length > 0;

      case 'RATING': {
        const rating = Number(value);
        return !isNaN(rating) && rating >= 1 && rating <= 5;
      }

      default:
        return false;
    }
  }

  // ── Avaliação de condição ─────────────────────────────────────
  private evaluateCondition(rule: ItemRule, value: unknown): boolean {
    const conditionType = rule.conditionType as ConditionType;
    const conditionValue = this.parseConditionValue(rule.conditionValue, value);
    const numericValue = Number(value);
    const numericCondition = Number(rule.conditionValue);

    switch (conditionType) {
      case 'EQUALS':
        return String(value) === String(rule.conditionValue);

      case 'NOT_EQUALS':
        return String(value) !== String(rule.conditionValue);

      case 'GREATER_THAN':
        return !isNaN(numericValue) && numericValue > numericCondition;

      case 'LESS_THAN':
        return !isNaN(numericValue) && numericValue < numericCondition;

      case 'GREATER_OR_EQUAL':
        return !isNaN(numericValue) && numericValue >= numericCondition;

      case 'LESS_OR_EQUAL':
        return !isNaN(numericValue) && numericValue <= numericCondition;

      case 'CONTAINS':
        return String(value).toLowerCase().includes(String(rule.conditionValue).toLowerCase());

      default:
        return false;
    }
  }

  private parseConditionValue(conditionValue: string, referenceValue: unknown): unknown {
    if (typeof referenceValue === 'boolean') {
      return conditionValue === 'true';
    }
    if (!isNaN(Number(conditionValue))) {
      return Number(conditionValue);
    }
    return conditionValue;
  }
}
