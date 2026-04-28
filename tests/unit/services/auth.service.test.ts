import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { AuthRepository } from '../../../src/modules/auth/repositories/auth.repository';
import * as bcrypt from 'bcryptjs';

// Mock do repositório
vi.mock('../../../src/modules/auth/repositories/auth.repository');
vi.mock('../../../src/shared/config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-with-minimum-32-chars!!',
    JWT_EXPIRES_IN: '7d',
    BCRYPT_SALT_ROUNDS: 12,
  },
}));
vi.mock('../../../src/shared/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock('../../../src/shared/config/database', () => ({
  prisma: {
    $on: vi.fn(),
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock do bcryptjs (Named + Default handles both import styles)
vi.mock('bcryptjs', () => {
  const m = {
    compare: vi.fn(),
    hash: vi.fn(),
    default: {
      compare: vi.fn(),
      hash: vi.fn(),
    }
  };
  m.default.compare = m.compare;
  m.default.hash = m.hash;
  return m;
});

const makeMockUser = () => ({
  id: 'user-123',
  tenantId: 'tenant-123',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: '$2a$12$hashedpassword',
  role: 'STAFF' as const,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AuthService', () => {
  let service: AuthService;
  let mockRepo: vi.Mocked<AuthRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
    mockRepo = vi.mocked(AuthRepository.prototype);
  });

  describe('login', () => {
    it('retorna token e usuário sem passwordHash em login válido', async () => {
      const mockUser = makeMockUser();
      mockRepo.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login('tenant-123', {
        email: 'test@example.com',
        password: 'senha123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('lança UnauthorizedError se usuário não existe', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('tenant-123', { email: 'nao@existe.com', password: 'senha' }),
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('lança UnauthorizedError se senha incorreta', async () => {
      const mockUser = makeMockUser();
      mockRepo.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login('tenant-123', { email: 'test@example.com', password: 'errada' }),
      ).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('register', () => {
    it('lança ConflictError se email já existe', async () => {
      const mockUser = makeMockUser();
      mockRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register('tenant-123', {
          name: 'Duplicado',
          email: 'test@example.com',
          password: 'senha12345',
          role: 'STAFF',
        }),
      ).rejects.toThrow('Email já cadastrado');
    });

    it('cria usuário e retorna sem passwordHash', async () => {
      const mockUser = makeMockUser();
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

      const result = await service.register('tenant-123', {
        name: 'Novo User',
        email: 'novo@example.com',
        password: 'senha12345',
        role: 'STAFF',
      });

      expect((result as any).passwordHash).toBeUndefined();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'novo@example.com' }),
      );
    });
  });
});
