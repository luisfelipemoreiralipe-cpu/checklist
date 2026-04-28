import { Router } from 'express';
import { GamificationController } from './controllers/gamification.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new GamificationController();

router.use(authenticate);

router.get('/ranking', controller.getRanking);
router.get('/me/score', controller.getMyScore);

export { router as gamificationRouter };
