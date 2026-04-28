import { User } from '@prisma/client';
import { prisma } from '../../../shared/config/database';

export class AuthRepository {
  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { tenantId, email, active: true },
    });
  }

  async findByEmailOnly(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, active: true },
    });
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, tenantId, active: true },
    });
  }

  async create(data: {
    tenantId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'ADMIN' | 'MANAGER' | 'STAFF';
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, tenantId: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }
}
