import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { buildWhatsAppLink, normalizePhone } from '../../common/utils/phone-normalizer';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.messageTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!template) {
      throw new NotFoundException(`Template com ID ${id} não encontrado`);
    }

    return template;
  }

  async create(dto: CreateTemplateDto) {
    return this.prisma.messageTemplate.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: string, dto: Partial<CreateTemplateDto>) {
    await this.findOne(id);
    return this.prisma.messageTemplate.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.messageTemplate.delete({ where: { id } });
  }

  interpolateTemplate(content: string, lead: any): string {
    const defaultContactName = 'responsável';
    const companyName = lead.tradeName || lead.name || '';
    const city = lead.city || 'sua região';
    const state = lead.state || '';
    const category = lead.category?.name || 'seu segmento';
    const site = lead.website || 'sem site';
    const phone = lead.phone || '';

    return content
      .replace(/{{\s*nome\s*}}/gi, defaultContactName)
      .replace(/{{\s*empresa\s*}}/gi, companyName)
      .replace(/{{\s*cidade\s*}}/gi, city)
      .replace(/{{\s*estado\s*}}/gi, state)
      .replace(/{{\s*categoria\s*}}/gi, category)
      .replace(/{{\s*site\s*}}/gi, site)
      .replace(/{{\s*telefone\s*}}/gi, phone);
  }

  async getPreview(templateId: string, leadId: string) {
    const [template, lead] = await Promise.all([
      this.findOne(templateId),
      this.prisma.lead.findUnique({
        where: { id: leadId },
        include: { category: true },
      }),
    ]);

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} não encontrado`);
    }

    const message = this.interpolateTemplate(template.content, lead);
    const phoneToUse = lead.normalizedPhone || lead.phone || '';
    const whatsAppLink = buildWhatsAppLink(phoneToUse, message);

    return {
      templateId: template.id,
      leadId: lead.id,
      leadName: lead.name,
      phone: lead.phone,
      normalizedPhone: lead.normalizedPhone,
      message,
      whatsAppLink,
    };
  }
}
