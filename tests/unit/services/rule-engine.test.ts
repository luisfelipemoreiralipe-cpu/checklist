import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RuleEngine } from '../../../src/modules/executions/services/rule-engine.service';
import { ChecklistItem, ItemRule, ItemType } from '@prisma/client';

// Helper para criar item fake
function makeItem(overrides?: Partial<ChecklistItem>): ChecklistItem & { rules: ItemRule[] } {
  return {
    id: 'item-1',
    checklistId: 'checklist-1',
    title: 'Temperatura da geladeira',
    description: null,
    type: 'NUMBER',
    required: true,
    weight: 3,
    isCritical: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    rules: [],
    ...overrides,
  } as ChecklistItem & { rules: ItemRule[] };
}

function makeRule(overrides?: Partial<ItemRule>): ItemRule {
  return {
    id: 'rule-1',
    checklistItemId: 'item-1',
    conditionType: 'GREATER_THAN',
    conditionValue: '8',
    actionType: 'GENERATE_ALERT',
    actionPayload: null,
    createdAt: new Date(),
    ...overrides,
  } as ItemRule;
}

describe('RuleEngine', () => {
  let engine: RuleEngine;

  beforeEach(() => {
    engine = new RuleEngine();
  });

  // ── validateAnswer ─────────────────────────────────────────────
  describe('validateAnswer', () => {
    it('valida BOOLEAN corretamente', () => {
      const item = makeItem({ type: 'BOOLEAN' });
      expect(engine.validateAnswer(item, true)).toBe(true);
      expect(engine.validateAnswer(item, false)).toBe(true);
      expect(engine.validateAnswer(item, 'sim')).toBe(false);
    });

    it('valida NUMBER corretamente', () => {
      const item = makeItem({ type: 'NUMBER' });
      expect(engine.validateAnswer(item, 5)).toBe(true);
      expect(engine.validateAnswer(item, 0)).toBe(true);
      expect(engine.validateAnswer(item, 'abc')).toBe(false);
    });

    it('valida RATING entre 1 e 5', () => {
      const item = makeItem({ type: 'RATING' });
      expect(engine.validateAnswer(item, 3)).toBe(true);
      expect(engine.validateAnswer(item, 0)).toBe(false);
      expect(engine.validateAnswer(item, 6)).toBe(false);
    });

    it('valida TEXT não vazio', () => {
      const item = makeItem({ type: 'TEXT' });
      expect(engine.validateAnswer(item, 'ok')).toBe(true);
      expect(engine.validateAnswer(item, '')).toBe(false);
      expect(engine.validateAnswer(item, '   ')).toBe(false);
    });
  });

  // ── calculateScoreImpact ───────────────────────────────────────
  describe('calculateScoreImpact', () => {
    it('retorna peso positivo em resposta válida', () => {
      const item = makeItem({ weight: 3, isCritical: false });
      expect(engine.calculateScoreImpact(item, true, true)).toBe(3);
    });

    it('retorna penalidade simples em item não crítico inválido', () => {
      const item = makeItem({ weight: 2, isCritical: false });
      expect(engine.calculateScoreImpact(item, false, false)).toBe(-2);
    });

    it('retorna penalidade dupla em item crítico inválido', () => {
      const item = makeItem({ weight: 3, isCritical: true });
      expect(engine.calculateScoreImpact(item, false, false)).toBe(-6);
    });
  });

  // ── evaluateRules ──────────────────────────────────────────────
  describe('evaluateRules', () => {
    it('dispara ação quando condição GREATER_THAN é atendida', () => {
      const rule = makeRule({ conditionType: 'GREATER_THAN', conditionValue: '8', actionType: 'GENERATE_ALERT' });
      const item = makeItem({ rules: [rule] });

      const actions = engine.evaluateRules(item, 10);
      expect(actions).toHaveLength(1);
      expect(actions[0].actionType).toBe('GENERATE_ALERT');
    });

    it('não dispara ação quando condição não é atendida', () => {
      const rule = makeRule({ conditionType: 'GREATER_THAN', conditionValue: '8', actionType: 'GENERATE_ALERT' });
      const item = makeItem({ rules: [rule] });

      const actions = engine.evaluateRules(item, 5);
      expect(actions).toHaveLength(0);
    });

    it('dispara para condição EQUALS', () => {
      const rule = makeRule({ conditionType: 'EQUALS', conditionValue: 'false', actionType: 'NOTIFY_MANAGER' });
      const item = makeItem({ type: 'BOOLEAN', rules: [rule] });

      const actions = engine.evaluateRules(item, false);
      expect(actions).toHaveLength(1);
    });

    it('dispara para condição LESS_OR_EQUAL com rating', () => {
      const rule = makeRule({ conditionType: 'LESS_OR_EQUAL', conditionValue: '2', actionType: 'NOTIFY_MANAGER' });
      const item = makeItem({ type: 'RATING', rules: [rule] });

      expect(engine.evaluateRules(item, 1)).toHaveLength(1);
      expect(engine.evaluateRules(item, 2)).toHaveLength(1);
      expect(engine.evaluateRules(item, 3)).toHaveLength(0);
    });

    it('retorna array vazio quando item não tem regras', () => {
      const item = makeItem({ rules: [] });
      expect(engine.evaluateRules(item, 5)).toHaveLength(0);
    });
  });
});
