import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const settings = await this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    // Mapeia para dicionário chave-valor e lista agrupada
    const dict: Record<string, string> = {};
    for (const s of settings) {
      dict[s.key] = s.value;
    }

    return {
      settings,
      dict,
    };
  }

  async update(key: string, value: string, description?: string, group?: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: {
        value,
        ...(description ? { description } : {}),
        ...(group ? { group } : {}),
      },
      create: {
        key,
        value,
        description,
        group: group || 'GENERAL',
      },
    });
  }

  async updateMany(settings: Record<string, string>) {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      results.push(await this.update(key, String(value)));
    }
    return results;
  }
}
