import { Router } from 'express';
import { ExecutionController } from './controllers/execution.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import {
  startExecutionSchema,
  answerItemSchema,
  finishExecutionSchema,
  listExecutionQuerySchema,
} from './dtos/execution.dto';

const router = Router();
const controller = new ExecutionController();

router.use(authenticate);

router.post('/start', validate(startExecutionSchema), controller.start);
router.post('/:id/answer', validate(answerItemSchema), controller.answer);
router.post('/:id/finish', validate(finishExecutionSchema), controller.finish);
router.get('/', validate(listExecutionQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);

export { router as executionRouter };
