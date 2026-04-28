import { PrismaClient, UserRole, ChecklistCategory, ChecklistFrequency, ItemType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  // ── Tenant ───────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'restaurante-demo' },
    update: {},
    create: {
      name: 'Restaurante Demonstração',
      slug: 'restaurante-demo',
      plan: 'PRO',
    },
  });

  console.log(`✅ Tenant: ${tenant.name}`);

  // ── Usuários ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('senha123456', 12);

  const admin = await prisma.user.upsert({
    where: { id: 'admin-seed-id' },
    update: {},
    create: {
      id: 'admin-seed-id',
      tenantId: tenant.id,
      name: 'Carlos Admin',
      email: 'admin@restaurante.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { id: 'manager-seed-id' },
    update: {},
    create: {
      id: 'manager-seed-id',
      tenantId: tenant.id,
      name: 'Ana Gerente',
      email: 'gerente@restaurante.com',
      passwordHash,
      role: 'MANAGER',
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { id: 'staff1-seed-id' },
    update: {},
    create: {
      id: 'staff1-seed-id',
      tenantId: tenant.id,
      name: 'João Cozinheiro',
      email: 'joao@restaurante.com',
      passwordHash,
      role: 'STAFF',
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { id: 'staff2-seed-id' },
    update: {},
    create: {
      id: 'staff2-seed-id',
      tenantId: tenant.id,
      name: 'Maria Atendente',
      email: 'maria@restaurante.com',
      passwordHash,
      role: 'STAFF',
    },
  });

  console.log(`✅ Usuários criados: ${admin.name}, ${manager.name}, ${staff1.name}, ${staff2.name}`);

  // ── Checklist: Abertura da Cozinha ───────────────────────────
  const checklistAbertura = await prisma.checklistTemplate.upsert({
    where: { id: 'checklist-abertura-id' },
    update: {},
    create: {
      id: 'checklist-abertura-id',
      tenantId: tenant.id,
      name: 'Abertura da Cozinha',
      description: 'Checklist diário de abertura para equipe de cozinha',
      category: 'OPENING',
      frequency: 'DAILY',
    },
  });

  // Itens do checklist de abertura
  const itensAbertura = [
    {
      id: 'item-temp-geladeira',
      title: 'Temperatura da geladeira',
      description: 'Verificar se está entre 0°C e 4°C',
      type: 'NUMBER' as ItemType,
      required: true,
      weight: 3,
      isCritical: true,
      order: 1,
    },
    {
      id: 'item-limpeza-bancada',
      title: 'Bancadas limpas e higienizadas',
      type: 'BOOLEAN' as ItemType,
      required: true,
      weight: 2,
      isCritical: false,
      order: 2,
    },
    {
      id: 'item-uniforme',
      title: 'Equipe com uniforme completo',
      type: 'BOOLEAN' as ItemType,
      required: true,
      weight: 1,
      isCritical: false,
      order: 3,
    },
    {
      id: 'item-validade-produtos',
      title: 'Verificação de validade dos produtos',
      type: 'BOOLEAN' as ItemType,
      required: true,
      weight: 3,
      isCritical: true,
      order: 4,
    },
    {
      id: 'item-foto-cozinha',
      title: 'Foto da cozinha organizada',
      type: 'PHOTO' as ItemType,
      required: false,
      weight: 1,
      isCritical: false,
      order: 5,
    },
    {
      id: 'item-avaliacao-geral',
      title: 'Avaliação geral das condições',
      description: 'Nota de 1 a 5',
      type: 'RATING' as ItemType,
      required: true,
      weight: 2,
      isCritical: false,
      order: 6,
    },
  ];

  for (const item of itensAbertura) {
    await prisma.checklistItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, checklistId: checklistAbertura.id, description: (item as any).description ?? null },
    });
  }

  // Regra: se temperatura > 8 → gerar alerta crítico
  await prisma.itemRule.upsert({
    where: { id: 'rule-temp-alta' },
    update: {},
    create: {
      id: 'rule-temp-alta',
      checklistItemId: 'item-temp-geladeira',
      conditionType: 'GREATER_THAN',
      conditionValue: '8',
      actionType: 'GENERATE_ALERT',
      actionPayload: { message: 'Temperatura da geladeira acima do permitido!' },
    },
  });

  // Regra: se avaliação <= 2 → notificar gerente
  await prisma.itemRule.upsert({
    where: { id: 'rule-avaliacao-baixa' },
    update: {},
    create: {
      id: 'rule-avaliacao-baixa',
      checklistItemId: 'item-avaliacao-geral',
      conditionType: 'LESS_OR_EQUAL',
      conditionValue: '2',
      actionType: 'NOTIFY_MANAGER',
      actionPayload: { urgency: 'high' },
    },
  });

  console.log(`✅ Checklist: ${checklistAbertura.name} com ${itensAbertura.length} itens`);

  // ── Checklist: Limpeza Semanal ────────────────────────────────
  const checklistLimpeza = await prisma.checklistTemplate.upsert({
    where: { id: 'checklist-limpeza-id' },
    update: {},
    create: {
      id: 'checklist-limpeza-id',
      tenantId: tenant.id,
      name: 'Limpeza Semanal Profunda',
      description: 'Limpeza completa realizada toda segunda-feira',
      category: 'CLEANING',
      frequency: 'WEEKLY',
    },
  });

  const itensLimpeza = [
    { id: 'item-coifa', title: 'Limpeza da coifa', type: 'BOOLEAN' as ItemType, required: true, weight: 3, isCritical: true, order: 1 },
    { id: 'item-piso-coz', title: 'Piso da cozinha higienizado', type: 'BOOLEAN' as ItemType, required: true, weight: 2, isCritical: false, order: 2 },
    { id: 'item-evidencia-limpeza', title: 'Foto de evidência da limpeza', type: 'PHOTO' as ItemType, required: true, weight: 2, isCritical: false, order: 3 },
    { id: 'item-obs-limpeza', title: 'Observações adicionais', type: 'TEXT' as ItemType, required: false, weight: 1, isCritical: false, order: 4 },
  ];

  for (const item of itensLimpeza) {
    await prisma.checklistItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, checklistId: checklistLimpeza.id },
    });
  }

  console.log(`✅ Checklist: ${checklistLimpeza.name}`);

  // ── Scores iniciais ───────────────────────────────────────────
  await prisma.userScore.upsert({
    where: { userId_tenantId: { userId: staff1.id, tenantId: tenant.id } },
    update: {},
    create: { userId: staff1.id, tenantId: tenant.id, score: 450, level: 5 },
  });

  await prisma.userScore.upsert({
    where: { userId_tenantId: { userId: staff2.id, tenantId: tenant.id } },
    update: {},
    create: { userId: staff2.id, tenantId: tenant.id, score: 280, level: 3 },
  });

  console.log('✅ Scores de gamificação criados');

  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Tenant ID:', tenant.id);
  console.log('Usuários para teste:');
  console.log('  ADMIN   → admin@restaurante.com  / senha123456');
  console.log('  MANAGER → gerente@restaurante.com / senha123456');
  console.log('  STAFF   → joao@restaurante.com   / senha123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  Para login, use o header: X-Tenant-Id:', tenant.id);
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
