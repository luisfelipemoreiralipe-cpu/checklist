import { Router } from 'express';
import { ChecklistController } from './controllers/checklist.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import {
  createChecklistSchema,
  updateChecklistSchema,
  createItemSchema,
  updateItemSchema,
  createRuleSchema,
  listChecklistQuerySchema,
} from './dtos/checklist.dto';

const router = Router();
const controller = new ChecklistController();

// Todas as rotas requerem autenticação
router.use(authenticate);

// ── Templates ─────────────────────────────────────────────────
router.get('/', validate(listChecklistQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('MANAGER', 'ADMIN'), validate(createChecklistSchema), controller.create);
router.put('/:id', authorize('MANAGER', 'ADMIN'), validate(updateChecklistSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

// ── Items (sub-recurso do checklist) ─────────────────────────
router.post(
  '/:id/items',
  authorize('MANAGER', 'ADMIN'),
  validate(createItemSchema),
  controller.addItem,
);

export { router as checklistRouter };

// ── Rotas independentes de items ──────────────────────────────
const itemRouter = Router();
itemRouter.use(authenticate);

itemRouter.put('/:id', authorize('MANAGER', 'ADMIN'), validate(updateItemSchema), controller.updateItem);
itemRouter.delete('/:id', authorize('MANAGER', 'ADMIN'), controller.deleteItem);
itemRouter.post('/:id/rules', authorize('MANAGER', 'ADMIN'), validate(createRuleSchema), controller.addRule);

export { itemRouter as checklistItemRouter };
