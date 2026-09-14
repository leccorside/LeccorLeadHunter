import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryLeadDto } from '../leads/dto/query-lead.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ExportImportService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFilteredLeads(query: QueryLeadDto) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.city) where.city = { equals: query.city, mode: 'insensitive' };
    if (query.state) where.state = { equals: query.state, mode: 'insensitive' };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.hasWebsite !== undefined && query.hasWebsite !== '') {
      where.hasWebsite = query.hasWebsite === 'true';
    }
    if (query.hasWhatsapp !== undefined && query.hasWhatsapp !== '') {
      if (query.hasWhatsapp === 'true') {
        where.whatsappStatus = { not: 'NOT_FOUND' };
        where.normalizedPhone = { not: null };
      } else {
        where.OR = [{ whatsappStatus: 'NOT_FOUND' }, { normalizedPhone: null }];
      }
    }
    if (query.minRating !== undefined) where.rating = { gte: Number(query.minRating) };
    if (query.minReviews !== undefined) where.reviewCount = { gte: Number(query.minReviews) };
    if (query.minScore !== undefined) where.score = { gte: Number(query.minScore) };
    if (query.status) where.status = query.status;

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { score: 'desc' },
      include: { category: true },
    });

    return leads.map((l) => ({
      ID: l.id,
      Nome: l.name,
      'Nome Fantasia': l.tradeName || '',
      Categoria: l.category?.name || '',
      Telefone: l.phone || '',
      'Telefone Normalizado': l.normalizedPhone || '',
      WhatsApp: l.whatsappStatus,
      Email: l.email || '',
      Website: l.website || '',
      'Possui Site': l.hasWebsite ? 'Sim' : 'Não',
      Endereço: l.address || '',
      Bairro: l.neighborhood || '',
      Cidade: l.city || '',
      Estado: l.state || '',
      CEP: l.postalCode || '',
      Nota: Number(l.rating) || 0,
      'Quantidade de Avaliações': l.reviewCount || 0,
      Score: l.score,
      Status: l.status,
      Favorito: l.favorite ? 'Sim' : 'Não',
      'Google Maps': l.googleMapsUrl || '',
      'Data de Descoberta': l.createdAt.toLocaleDateString('pt-BR'),
    }));
  }

  async exportToExcel(query: QueryLeadDto): Promise<Buffer> {
    const data = await this.getFilteredLeads(query);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportToCsv(query: QueryLeadDto): Promise<string> {
    const data = await this.getFilteredLeads(query);
    const worksheet = XLSX.utils.json_to_sheet(data);
    return XLSX.utils.sheet_to_csv(worksheet);
  }
}
