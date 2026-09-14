import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.contact.findMany({
      orderBy: { sentAt: 'desc' },
      include: {
        lead: {
          select: { id: true, name: true, phone: true, city: true, state: true },
        },
        messageTemplate: { select: { id: true, name: true } },
      },
    });
  }

  async findByLead(leadId: string) {
    return this.prisma.contact.findMany({
      where: { leadId },
      orderBy: { sentAt: 'desc' },
      include: { messageTemplate: true },
    });
  }
}
