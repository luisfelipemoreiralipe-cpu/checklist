import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private readonly service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  // POST /auth/signup
  signup = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.signup(req.body);

    res.status(201).json({
      message: 'Estabelecimento cadastrado com sucesso',
      data: result,
    });
  };

  // POST /auth/login
  login = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.headers['x-tenant-id'] as string;
    const result = await this.service.login(tenantId, req.body);

    res.status(200).json({
      message: 'Login realizado com sucesso',
      data: result,
    });
  };

  // POST /auth/register  (requer ADMIN)
  register = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const user = await this.service.register(tenantId, req.body);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      data: user,
    });
  };

  // GET /auth/me
  me = async (req: Request, res: Response): Promise<void> => {
    const { sub: userId, tenantId } = req.user;
    const profile = await this.service.getProfile(userId, tenantId);

    res.status(200).json({ data: profile });
  };
}
