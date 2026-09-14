import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FollowUpsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.followUp.findMany({
      orderBy: { scheduledFor: 'asc' },
      include: {
        lead: {
          select: { id: true, name: true, phone: true, city: true, state: true, status: true },
        },
      },
    });
  }

  async getDashboardFollowUps() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [overdue, today, upcoming] = await Promise.all([
      // Atrasados: agendados antes de hoje e ainda PENDING
      this.prisma.followUp.findMany({
        where: {
          status: 'PENDING',
          scheduledFor: { lt: startOfToday },
        },
        include: {
          lead: {
            select: { id: true, name: true, phone: true, normalizedPhone: true, city: true, status: true },
          },
        },
        orderBy: { scheduledFor: 'asc' },
        take: 10,
      }),
      // Hoje: agendados entre 00:00 e 23:59 de hoje
      this.prisma.followUp.findMany({
        where: {
          status: 'PENDING',
          scheduledFor: { gte: startOfToday, lte: endOfToday },
        },
        include: {
          lead: {
            select: { id: true, name: true, phone: true, normalizedPhone: true, city: true, status: true },
          },
        },
        orderBy: { scheduledFor: 'asc' },
        take: 10,
      }),
      // Próximos: agendados após hoje
      this.prisma.followUp.findMany({
        where: {
          status: 'PENDING',
          scheduledFor: { gt: endOfToday },
        },
        include: {
          lead: {
            select: { id: true, name: true, phone: true, normalizedPhone: true, city: true, status: true },
          },
        },
        orderBy: { scheduledFor: 'asc' },
        take: 10,
      }),
    ]);

    return {
      overdue,
      today,
      upcoming,
      totalPending: overdue.length + today.length + upcoming.length,
    };
  }

  async complete(id: string) {
    const followUp = await this.prisma.followUp.findUnique({ where: { id } });
    if (!followUp) throw new NotFoundException(`Follow-up ${id} não encontrado`);

    return this.prisma.followUp.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async cancel(id: string) {
    const followUp = await this.prisma.followUp.findUnique({ where: { id } });
    if (!followUp) throw new NotFoundException(`Follow-up ${id} não encontrado`);

    return this.prisma.followUp.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }
}
