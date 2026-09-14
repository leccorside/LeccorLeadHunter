import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campanha ${id} não encontrada`);
    }

    return campaign;
  }

  async create(dto: CreateCampaignDto) {
    // Calcula estatísticas iniciais com base nos filtros
    let totalFound = 0;
    let totalContacted = 0;
    let totalResponded = 0;
    let totalConverted = 0;

    if (dto.filtersJson) {
      const filters = dto.filtersJson;
      const where: any = {};

      if (filters.city) where.city = { equals: filters.city, mode: 'insensitive' };
      if (filters.state) where.state = { equals: filters.state, mode: 'insensitive' };
      if (filters.hasWebsite !== undefined) where.hasWebsite = filters.hasWebsite === true || filters.hasWebsite === 'true';
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.minReviews) where.reviewCount = { gte: Number(filters.minReviews) };

      totalFound = await this.prisma.lead.count({ where });
      totalContacted = await this.prisma.lead.count({
        where: { ...where, status: { in: ['CONTATADO', 'RESPONDEU', 'INTERESSADO', 'NEGOCIACAO', 'CLIENTE'] } },
      });
      totalResponded = await this.prisma.lead.count({
        where: { ...where, status: { in: ['RESPONDEU', 'INTERESSADO', 'NEGOCIACAO', 'CLIENTE'] } },
      });
      totalConverted = await this.prisma.lead.count({
        where: { ...where, status: 'CLIENTE' },
      });
    }

    return this.prisma.campaign.create({
      data: {
        name: dto.name,
        description: dto.description,
        filtersJson: dto.filtersJson,
        totalFound,
        totalContacted,
        totalResponded,
        totalConverted,
      },
    });
  }

  async update(id: string, dto: Partial<CreateCampaignDto>) {
    await this.findOne(id);
    return this.prisma.campaign.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.campaign.delete({ where: { id } });
  }
}
