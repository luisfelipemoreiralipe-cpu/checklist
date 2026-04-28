import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { env } from '../../../shared/config/env';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { AuthRepository } from '../repositories/auth.repository';
import { LoginDto, RegisterDto, SignUpDto } from '../dtos/auth.dto';
import { JwtPayload } from '../../../shared/middlewares/auth.middleware';
import { prisma } from '../../../shared/config/database';
import { logger } from '../../../shared/logger';

// Projeção pública do usuário (sem senha)
type PublicUser = Omit<User, 'passwordHash'>;

interface LoginResponse {
  token: string;
  user: PublicUser;
}

export class AuthService {
  private readonly repo: AuthRepository;

  constructor() {
    this.repo = new AuthRepository();
  }

  // ── Sign Up (Novo Estabelecimento) ───────────────────────────
  async signup(dto: SignUpDto): Promise<LoginResponse> {
    // Verifica conflitos
    const existingTenant = await prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (existingTenant) throw new ConflictError('Este slug de empresa já está em uso');

    const existingUser = await prisma.user.findFirst({ where: { email: dto.email } });
    if (existingUser) throw new ConflictError('Este email já está cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);

    // Cria tudo em transação
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          slug: dto.slug,
          plan: 'FREE',
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: dto.adminName,
          email: dto.email,
          passwordHash,
          role: 'ADMIN',
        },
      });

      return { user };
    });

    const token = this.generateToken(result.user);
    const publicUser = this.sanitizeUser(result.user);

    logger.info('Novo estabelecimento cadastrado', {
      tenantSlug: dto.slug,
      adminEmail: dto.email,
    });

    return { token, user: publicUser };
  }

  // ── Login ────────────────────────────────────────────────────
  async login(tenantId: string | undefined, dto: LoginDto): Promise<LoginResponse> {
    // Se tenantId fornecido, busca no tenant. Senão, busca por email globalmente.
    const user = tenantId
      ? await this.repo.findByEmail(tenantId, dto.email)
      : await this.repo.findByEmailOnly(dto.email);

    if (!user) {
      // Mensagem genérica — não revela se o email existe ou não
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      logger.warn('Tentativa de login com senha incorreta', {
        email: dto.email,
        tenantId,
      });
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const token = this.generateToken(user);
    const publicUser = this.sanitizeUser(user);

    logger.info('Login realizado com sucesso', {
      userId: user.id,
      email: user.email,
      tenantId,
    });

    return { token, user: publicUser };
  }

  // ── Registrar usuário (apenas ADMIN pode registrar outros) ───
  async register(tenantId: string, dto: RegisterDto): Promise<PublicUser> {
    const existing = await this.repo.findByEmail(tenantId, dto.email);

    if (existing) {
      throw new ConflictError('Email já cadastrado neste tenant');
    }

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);

    const user = await this.repo.create({
      tenantId,
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    logger.info('Usuário registrado', { userId: user.id, tenantId, role: dto.role });

    return this.sanitizeUser(user);
  }

  // ── Perfil do usuário logado ─────────────────────────────────
  async getProfile(userId: string, tenantId: string): Promise<PublicUser> {
    const user = await this.repo.findById(userId, tenantId);

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    return this.sanitizeUser(user);
  }

  // ── Helpers privados ─────────────────────────────────────────
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  private sanitizeUser(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
