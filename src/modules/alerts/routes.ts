import { Router } from 'express';
import { AlertController } from './controllers/alert.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new AlertController();

router.use(authenticate);
router.use(authorize('MANAGER', 'ADMIN')); // STAFF não vê alertas

router.get('/', controller.list);
router.patch('/:id/resolve', controller.resolve);

export { router as alertRouter };
