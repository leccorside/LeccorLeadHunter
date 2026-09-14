import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { ScoringService } from './services/scoring.service';
import { normalizePhone } from '../../common/utils/phone-normalizer';
import { LeadStatus, Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  async findAll(query: QueryLeadDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 25;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.city) {
      where.city = { equals: query.city, mode: 'insensitive' };
    }

    if (query.state) {
      where.state = { equals: query.state, mode: 'insensitive' };
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.hasWebsite !== undefined && query.hasWebsite !== '') {
      where.hasWebsite = query.hasWebsite === 'true';
    }

    if (query.hasWhatsapp !== undefined && query.hasWhatsapp !== '') {
      if (query.hasWhatsapp === 'true') {
        where.whatsappStatus = { not: 'NOT_FOUND' };
        where.normalizedPhone = { not: null };
      } else {
        where.OR = [
          { whatsappStatus: 'NOT_FOUND' },
          { normalizedPhone: null },
        ];
      }
    }

    if (query.minRating !== undefined) {
      where.rating = { gte: Number(query.minRating) };
    }
    if (query.maxRating !== undefined) {
      where.rating = { ...(where.rating as any), lte: Number(query.maxRating) };
    }

    if (query.minReviews !== undefined) {
      where.reviewCount = { gte: Number(query.minReviews) };
    }
    if (query.maxReviews !== undefined) {
      where.reviewCount = { ...(where.reviewCount as any), lte: Number(query.maxReviews) };
    }

    if (query.minScore !== undefined) {
      where.score = { gte: Number(query.minScore) };
    }
    if (query.maxScore !== undefined) {
      where.score = { ...(where.score as any), lte: Number(query.maxScore) };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.favorite !== undefined && query.favorite !== '') {
      where.favorite = query.favorite === 'true';
    }

    if (query.isContacted !== undefined && query.isContacted !== '') {
      if (query.isContacted === 'true') {
        where.contacts = { some: {} };
      } else {
        where.contacts = { none: {} };
      }
    }

    // Ordenação
    const allowedSortFields = ['createdAt', 'score', 'rating', 'reviewCount', 'name', 'status'];
    const sortField = allowedSortFields.includes(query.sortBy || '') ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, leads] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          category: true,
          contacts: {
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
          followUps: {
            where: { status: 'PENDING' },
            orderBy: { scheduledFor: 'asc' },
            take: 1,
          },
          _count: {
            select: { contacts: true, notes: true },
          },
        },
      }),
    ]);

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        category: true,
        contacts: {
          include: { messageTemplate: true },
          orderBy: { sentAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          orderBy: { scheduledFor: 'asc' },
        },
        websiteAnalysis: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead com id ${id} não encontrado`);
    }

    return lead;
  }

  async create(dto: CreateLeadDto) {
    // Normalização de telefone
    const phoneNorm = normalizePhone(dto.phone);

    // Calcular score inicial
    const scoreResult = this.scoringService.calculateScore({
      hasWebsite: dto.hasWebsite,
      phone: dto.phone,
      normalizedPhone: phoneNorm.e164,
      whatsappStatus: dto.whatsappStatus,
      reviewCount: dto.reviewCount,
      rating: dto.rating,
    });

    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        normalizedPhone: phoneNorm.isValid ? phoneNorm.e164 : null,
        score: scoreResult.score,
        history: {
          create: {
            action: 'CRIACAO',
            description: 'Lead cadastrado no sistema',
            metadata: { score: scoreResult.score, provider: dto.provider || 'MANUAL' },
          },
        },
      },
      include: { category: true },
    });

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    const current = await this.findOne(id);

    // Se houver alteração no telefone ou site, recalcula score
    const phoneNorm = dto.phone !== undefined ? normalizePhone(dto.phone) : undefined;
    const hasWebsite = dto.hasWebsite !== undefined ? dto.hasWebsite : current.hasWebsite;
    const phone = dto.phone !== undefined ? dto.phone : current.phone;
    const reviewCount = dto.reviewCount !== undefined ? dto.reviewCount : current.reviewCount;
    const rating = dto.rating !== undefined ? dto.rating : Number(current.rating);

    const scoreResult = this.scoringService.calculateScore({
      hasWebsite,
      phone,
      normalizedPhone: phoneNorm ? phoneNorm.e164 : current.normalizedPhone,
      whatsappStatus: dto.whatsappStatus || current.whatsappStatus,
      reviewCount,
      rating,
    });

    // Registrar histórico se status mudar
    const historyData: Prisma.LeadHistoryCreateWithoutLeadInput[] = [];
    if (dto.status && dto.status !== current.status) {
      historyData.push({
        action: 'STATUS_ALTERADO',
        description: `Status alterado de ${current.status} para ${dto.status}`,
        metadata: { from: current.status, to: dto.status },
      });
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        ...(phoneNorm ? { normalizedPhone: phoneNorm.isValid ? phoneNorm.e164 : null } : {}),
        score: scoreResult.score,
        ...(historyData.length > 0 ? { history: { create: historyData } } : {}),
      },
      include: { category: true },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.delete({ where: { id } });
  }

  async addNote(leadId: string, note: string) {
    await this.findOne(leadId);
    const createdNote = await this.prisma.leadNote.create({
      data: { leadId, note },
    });

    await this.prisma.leadHistory.create({
      data: {
        leadId,
        action: 'NOTA_ADICIONADA',
        description: `Nota adicionada: "${note.substring(0, 60)}${note.length > 60 ? '...' : ''}"`,
      },
    });

    return createdNote;
  }

  async addFollowUp(leadId: string, scheduledFor: string, reason: string) {
    await this.findOne(leadId);
    const followUp = await this.prisma.followUp.create({
      data: {
        leadId,
        scheduledFor: new Date(scheduledFor),
        reason,
        status: 'PENDING',
      },
    });

    await this.prisma.leadHistory.create({
      data: {
        leadId,
        action: 'FOLLOW_UP_AGENDADO',
        description: `Follow-up agendado para ${new Date(scheduledFor).toLocaleString('pt-BR')}: ${reason}`,
      },
    });

    // Opcionalmente atualiza status do lead para FOLLOW_UP
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { status: 'FOLLOW_UP' },
    });

    return followUp;
  }

  async recordContact(
    leadId: string,
    type: 'WHATSAPP' | 'EMAIL' | 'PHONE' | 'IN_PERSON',
    messageText: string,
    messageTemplateId?: string,
  ) {
    const lead = await this.findOne(leadId);

    const contact = await this.prisma.contact.create({
      data: {
        leadId,
        type,
        messageText,
        messageTemplateId,
        sentAt: new Date(),
      },
    });

    // Atualiza status para CONTATADO se for NOVO ou NAO_CONTATADO
    if (lead.status === 'NOVO' || lead.status === 'NAO_CONTATADO') {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { status: 'CONTATADO' },
      });
    }

    await this.prisma.leadHistory.create({
      data: {
        leadId,
        action: `CONTATO_${type}`,
        description: `Contato iniciado via ${type}`,
        metadata: { messageTemplateId, messagePreview: messageText.substring(0, 100) },
      },
    });

    return contact;
  }

  async getKanbanData() {
    const statuses: LeadStatus[] = [
      LeadStatus.NOVO,
      LeadStatus.CONTATADO,
      LeadStatus.RESPONDEU,
      LeadStatus.INTERESSADO,
      LeadStatus.NEGOCIACAO,
      LeadStatus.CLIENTE,
      LeadStatus.SEM_INTERESSE,
    ];

    const leads = await this.prisma.lead.findMany({
      where: {
        status: { in: statuses },
      },
      orderBy: { score: 'desc' },
      include: {
        category: true,
        _count: { select: { contacts: true, notes: true } },
      },
    });

    const columns = statuses.reduce((acc, status) => {
      acc[status] = leads.filter((l) => l.status === status);
      return acc;
    }, {} as Record<LeadStatus, typeof leads>);

    return columns;
  }
}
