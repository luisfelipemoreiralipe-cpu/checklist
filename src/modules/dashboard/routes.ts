import { Router } from 'express';
import { DashboardController } from './controllers/dashboard.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);
router.use(authorize('MANAGER', 'ADMIN'));

router.get('/', controller.overview);
router.get('/compliance-history', controller.complianceHistory);
router.get('/failures', controller.failures);
router.get('/user-ranking', controller.userRanking);

export { router as dashboardRouter };
