import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { loginSchema, registerSchema, signUpSchema } from './dtos/auth.dto';

const router = Router();
const controller = new AuthController();

// POST /auth/signup — público (Onboarding)
router.post('/signup', validate(signUpSchema), controller.signup);

// POST /auth/login — público
router.post('/login', validate(loginSchema), controller.login);

// POST /auth/register — requer autenticação e role ADMIN
router.post(
  '/register',
  authenticate,
  authorize('ADMIN'),
  validate(registerSchema),
  controller.register,
);

// GET /auth/me — requer autenticação
router.get('/me', authenticate, controller.me);

export { router as authRouter };
