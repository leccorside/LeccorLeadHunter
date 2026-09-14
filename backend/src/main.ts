import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilita CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Prefixo global para a API
  app.setGlobalPrefix('api');

  // Validação automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro de exceções global e interceptor de transformação
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Configuração do Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('LeadHunter Local - API')
    .setDescription(
      'Documentação oficial dos endpoints REST da plataforma de CRM e Prospecção Comercial LeadHunter Local',
    )
    .setVersion('1.0.0')
    .addTag('Dashboard', 'Métricas e visão geral consolidada')
    .addTag('Buscas', 'Prospecção e busca assíncrona de empresas via BullMQ')
    .addTag('Leads', 'Gestão, kanban, timeline e detalhes de leads')
    .addTag('Categorias', 'Gestão de nichos e categorias de mercado')
    .addTag('Campanhas', 'Campanhas de prospecção e taxas de conversão')
    .addTag('Mensagens & Templates', 'Templates de mensagens com variáveis para WhatsApp')
    .addTag('Contatos', 'Histórico de abordagens e contatos comerciais')
    .addTag('Follow-ups', 'Agendamentos e lembretes de retorno')
    .addTag('Análise de Websites', 'Auditoria técnica de websites e SEO básico')
    .addTag('Exportação', 'Download de leads em Excel e CSV')
    .addTag('Localizações', 'Estados e cidades do Brasil')
    .addTag('Configurações', 'Parâmetros operacionais e chaves de API')
    .addTag('Health', 'Verificação de saúde do sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'LeadHunter Local - API Docs',
  });

  const port = process.env.APP_PORT || process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 LeadHunter Backend iniciado na porta ${port}`);
  logger.log(`📚 Swagger Docs disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
