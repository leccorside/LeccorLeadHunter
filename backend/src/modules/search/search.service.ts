import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { StartSearchDto } from './dto/start-search.dto';
import { SearchStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('lead-search') private readonly searchQueue: Queue,
  ) {}

  async startSearch(dto: StartSearchDto) {
    let categoryId = dto.categoryId;

    if (!categoryId && dto.categoryName && dto.categoryName !== 'Todas as categorias') {
      const slug = dto.categoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-');

      let category = await this.prisma.category.findFirst({
        where: { OR: [{ slug }, { name: dto.categoryName }] },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: dto.categoryName,
            slug,
            isCustom: true,
          },
        });
      }
      categoryId = category.id;
    }

    const searchRecord = await this.prisma.search.create({
      data: {
        provider: dto.provider || (process.env.GOOGLE_MAPS_API_KEY ? 'GOOGLE_PLACES' : 'OPENSTREETMAP'),
        country: dto.country || 'BR',
        state: dto.state,
        city: dto.city,
        categoryId: categoryId || null,
        radiusKm: dto.radiusKm || 10,
        maxResults: dto.maxResults || 50,
        filtersJson: {
          onlyWithoutWebsite: dto.onlyWithoutWebsite,
          onlyWithPhone: dto.onlyWithPhone,
          onlyWithWhatsapp: dto.onlyWithWhatsapp,
          onlyWithoutWhatsapp: dto.onlyWithoutWhatsapp,
          minReviews: dto.minReviews,
          maxReviews: dto.maxReviews,
          minRating: dto.minRating,
          maxRating: dto.maxRating,
          excludeExisting: dto.excludeExisting,
        },
        status: SearchStatus.PENDING,
      },
      include: { category: true },
    });

    // Enfileira o job com o BullMQ
    const job = await this.searchQueue.add(
      'process-search',
      {
        searchId: searchRecord.id,
        dto: {
          ...dto,
          categoryId,
        },
      },
      {
        jobId: searchRecord.id, // Permite referenciar pelo id da busca
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Job de busca ${searchRecord.id} adicionado à fila BullMQ (Job ID: ${job.id})`);

    return searchRecord;
  }

  async getSearchProgress(searchId: string) {
    const search = await this.prisma.search.findUnique({
      where: { id: searchId },
      include: {
        category: true,
      },
    });

    if (!search) {
      throw new NotFoundException(`Busca com id ${searchId} não encontrada`);
    }

    return search;
  }

  async cancelSearch(searchId: string) {
    const search = await this.prisma.search.findUnique({
      where: { id: searchId },
    });

    if (!search) {
      throw new NotFoundException(`Busca com id ${searchId} não encontrada`);
    }

    // Atualiza status no banco para cancelado
    const updated = await this.prisma.search.update({
      where: { id: searchId },
      data: {
        status: SearchStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    // Tenta cancelar o job na fila do BullMQ
    try {
      const job = await this.searchQueue.getJob(searchId);
      if (job) {
        await job.remove();
        this.logger.log(`Job ${searchId} removido da fila BullMQ.`);
      }
    } catch (e: any) {
      this.logger.warn(`Não foi possível remover job ${searchId} da fila: ${e.message}`);
    }

    return updated;
  }

  async findAll() {
    return this.prisma.search.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }
}
