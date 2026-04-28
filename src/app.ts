import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './shared/config/env';
import { logger } from './shared/logger';
import { globalErrorHandler } from './shared/errors/globalErrorHandler';

// Routers
import { authRouter } from './modules/auth/routes';
import { checklistRouter, checklistItemRouter } from './modules/checklists/routes';
import { executionRouter } from './modules/executions/routes';
import { gamificationRouter } from './modules/gamification/routes';
import { alertRouter } from './modules/alerts/routes';
import { dashboardRouter } from './modules/dashboard/routes';

const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // Headers de segurança HTTP (after CORS)

// ── Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' })); // limite explícito
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.url === '/health', // ignora health checks
  }),
);

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: process.env.npm_package_version ?? '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/checklists`, checklistRouter);
app.use(`${API_PREFIX}/items`, checklistItemRouter);
app.use(`${API_PREFIX}/executions`, executionRouter);
app.use(`${API_PREFIX}/gamification`, gamificationRouter);  // /ranking, /me/score
app.use(`${API_PREFIX}/alerts`, alertRouter);
app.use(`${API_PREFIX}/dashboard`, dashboardRouter);

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
    },
  });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(globalErrorHandler);

export { app };
