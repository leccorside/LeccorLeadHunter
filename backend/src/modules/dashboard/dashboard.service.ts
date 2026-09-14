import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FollowUpsService } from '../followups/followups.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followUpsService: FollowUpsService,
  ) {}

  async getDashboardData() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Métricas principais do topo
    const [
      totalLeads,
      leadsToday,
      leadsWithoutWebsite,
      leadsWithWhatsapp,
      leadsUncontacted,
      leadsConverted,
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.lead.count({
        where: { hasWebsite: false },
      }),
      this.prisma.lead.count({
        where: {
          whatsappStatus: { not: 'NOT_FOUND' },
          normalizedPhone: { not: null },
        },
      }),
      this.prisma.lead.count({
        where: {
          status: { in: ['NOVO', 'NAO_CONTATADO'] },
        },
      }),
      this.prisma.lead.count({
        where: { status: 'CLIENTE' },
      }),
    ]);

    // 2. Gráfico: Leads por dia (últimos 14 dias)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const leadsRecent = await this.prisma.lead.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    });

    const leadsByDayMap: Record<string, number> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      leadsByDayMap[key] = 0;
    }

    for (const lead of leadsRecent) {
      const key = lead.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (leadsByDayMap[key] !== undefined) {
        leadsByDayMap[key]++;
      }
    }

    const leadsByDay = Object.entries(leadsByDayMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 3. Gráfico: Leads por categoria
    const categoriesWithCount = await this.prisma.category.findMany({
      select: {
        name: true,
        _count: { select: { leads: true } },
      },
      orderBy: { leads: { _count: 'desc' } },
      take: 8,
    });

    const leadsByCategory = categoriesWithCount.map((c) => ({
      name: c.name,
      count: c._count.leads,
    }));

    // 4. Gráfico: Leads por cidade
    const citiesGroup = await this.prisma.lead.groupBy({
      by: ['city', 'state'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 6,
    });

    const leadsByCity = citiesGroup.map((cg) => ({
      city: cg.city || 'Desconhecida',
      state: cg.state || '',
      count: cg._count.id,
    }));

    // 5. Gráfico: Com site vs Sem site
    const leadsWithWebsite = await this.prisma.lead.count({ where: { hasWebsite: true } });
    const websiteDistribution = [
      { name: 'Sem Site', value: leadsWithoutWebsite, color: '#f59e0b' },
      { name: 'Com Site', value: leadsWithWebsite, color: '#3b82f6' },
    ];

    // 6. Gráfico: Leads por status
    const statusGroup = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const leadsByStatus = statusGroup.map((sg) => ({
      status: sg.status,
      count: sg._count.id,
    }));

    // 7. Gráfico: Leads por quantidade de avaliações
    const [revZero, rev1to20, rev21to50, rev51to100, rev100Plus] = await Promise.all([
      this.prisma.lead.count({ where: { OR: [{ reviewCount: 0 }, { reviewCount: null }] } }),
      this.prisma.lead.count({ where: { reviewCount: { gte: 1, lte: 20 } } }),
      this.prisma.lead.count({ where: { reviewCount: { gte: 21, lte: 50 } } }),
      this.prisma.lead.count({ where: { reviewCount: { gte: 51, lte: 100 } } }),
      this.prisma.lead.count({ where: { reviewCount: { gt: 100 } } }),
    ]);

    const leadsByReviewCount = [
      { range: '0', count: revZero },
      { range: '1-20', count: rev1to20 },
      { range: '21-50', count: rev21to50 },
      { range: '51-100', count: rev51to100 },
      { range: '100+', count: rev100Plus },
    ];

    // 8. Follow-ups
    const followUps = await this.followUpsService.getDashboardFollowUps();

    // 9. Oportunidades com maior score
    const topOpportunities = await this.prisma.lead.findMany({
      where: { status: { in: ['NOVO', 'NAO_CONTATADO'] } },
      orderBy: { score: 'desc' },
      take: 6,
      include: { category: true },
    });

    return {
      metrics: {
        totalLeads,
        leadsToday,
        leadsWithoutWebsite,
        leadsWithWhatsapp,
        leadsUncontacted,
        leadsConverted,
      },
      charts: {
        leadsByDay,
        leadsByCategory,
        leadsByCity,
        websiteDistribution,
        leadsByStatus,
        leadsByReviewCount,
      },
      followUps,
      topOpportunities,
    };
  }
}
