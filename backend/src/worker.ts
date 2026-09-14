import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Inicializando contexto de processamento do worker BullMQ...');

  const app = await NestFactory.createApplicationContext(AppModule);

  logger.log('⚙️ LeadHunter Worker em execução e escutando filas de busca e análise...');

  const handleShutdown = async (signal: string) => {
    logger.log(`Recebido sinal ${signal}. Encerrando worker suavemente...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrapWorker();
