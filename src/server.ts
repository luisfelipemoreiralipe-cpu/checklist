import { env } from './shared/config/env';
import { logger } from './shared/logger';
import { connectDatabase, disconnectDatabase } from './shared/config/database';
import { app } from './app';

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Servidor iniciado`, {
        port: env.PORT,
        env: env.NODE_ENV,
        url: `http://localhost:${env.PORT}`,
      });
    });

    // ── Graceful Shutdown ─────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`Recebido sinal ${signal}, encerrando servidor...`);

      server.close(async () => {
        await disconnectDatabase();
        logger.info('Servidor encerrado com sucesso');
        process.exit(0);
      });

      // Force shutdown após 10s se o servidor não encerrar
      setTimeout(() => {
        logger.error('Forçando encerramento após timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Erros não tratados — loga e encerra
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection', { reason });
      process.exit(1);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Falha ao iniciar servidor', { error });
    process.exit(1);
  }
}

bootstrap();
