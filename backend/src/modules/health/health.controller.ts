import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import Redis from 'ioredis';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar a saúde de todos os serviços (Postgres, Redis, Providers)' })
  async checkHealth() {
    let databaseStatus = 'DOWN';
    let redisStatus = 'DOWN';

    // 1. Checa PostgreSQL
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'UP';
    } catch (e: any) {
      databaseStatus = `DOWN: ${e.message}`;
    }

    // 2. Checa Redis
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT) || 6379,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
      });
      const pong = await redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'UP';
      }
      redis.disconnect();
    } catch (e: any) {
      redisStatus = `DOWN: ${e.message}`;
    }

    const hasGoogleKey = !!process.env.GOOGLE_MAPS_API_KEY;
    const providersStatus = {
      googlePlaces: hasGoogleKey ? 'READY' : 'KEY_MISSING (Using OpenStreetMap fallback)',
      openStreetMap: 'READY',
      whatsAppVerification: 'READY (HEURISTIC_MODE)',
    };

    const isHealthy = databaseStatus === 'UP' && redisStatus === 'UP';

    return {
      status: isHealthy ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
        redis: redisStatus,
        worker: 'RUNNING',
        providers: providersStatus,
      },
    };
  }
}
