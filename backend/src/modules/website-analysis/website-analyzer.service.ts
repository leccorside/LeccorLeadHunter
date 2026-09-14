import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';
import { ScoringService } from '../leads/services/scoring.service';

export interface AnalysisResult {
  isReachable: boolean;
  isHttps: boolean;
  statusCode: number | null;
  responseTimeMs: number;
  hasTitle: boolean;
  title: string | null;
  hasMetaDescription: boolean;
  metaDescription: string | null;
  hasViewport: boolean;
  score: number;
}

@Injectable()
export class WebsiteAnalyzerService {
  private readonly logger = new Logger(WebsiteAnalyzerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  async analyzeUrl(rawUrl: string): Promise<AnalysisResult> {
    let targetUrl = rawUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const isHttps = targetUrl.startsWith('https://');
    const startTime = Date.now();

    try {
      const response = await axios.get(targetUrl, {
        timeout: 8000,
        maxRedirects: 5,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (LeadHunter Local SEO Bot)',
        },
        validateStatus: () => true, // Permite ler status code mesmo se for 4xx/5xx
      });

      const responseTimeMs = Date.now() - startTime;
      const html = typeof response.data === 'string' ? response.data : '';

      // Análise básica do HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      const metaDescMatch =
        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
      const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

      const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
      const isReachable = response.status >= 200 && response.status < 400;

      // Cálculo de pontuação de qualidade do site (0 a 100)
      let seoScore = 0;
      if (isReachable) seoScore += 30;
      if (isHttps) seoScore += 20;
      if (title && title.length > 5) seoScore += 15;
      if (metaDescription && metaDescription.length > 10) seoScore += 15;
      if (hasViewport) seoScore += 10;
      if (responseTimeMs < 2000) seoScore += 10;

      return {
        isReachable,
        isHttps,
        statusCode: response.status,
        responseTimeMs,
        hasTitle: !!title,
        title,
        hasMetaDescription: !!metaDescription,
        metaDescription,
        hasViewport,
        score: seoScore,
      };
    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;
      this.logger.warn(`Erro ao analisar website ${targetUrl}: ${error.message}`);
      return {
        isReachable: false,
        isHttps,
        statusCode: null,
        responseTimeMs,
        hasTitle: false,
        title: null,
        hasMetaDescription: false,
        metaDescription: null,
        hasViewport: false,
        score: 0,
      };
    }
  }

  async analyzeLeadWebsite(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} não encontrado`);
    }

    if (!lead.website) {
      return { message: 'Este lead não possui website cadastrado para análise.' };
    }

    const result = await this.analyzeUrl(lead.website);

    // Salva ou atualiza a análise no banco
    const analysis = await this.prisma.websiteAnalysis.upsert({
      where: { leadId },
      update: {
        isReachable: result.isReachable,
        isHttps: result.isHttps,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        hasTitle: result.hasTitle,
        title: result.title,
        hasMetaDescription: result.hasMetaDescription,
        metaDescription: result.metaDescription,
        hasViewport: result.hasViewport,
        score: result.score,
        analyzedAt: new Date(),
      },
      create: {
        leadId,
        isReachable: result.isReachable,
        isHttps: result.isHttps,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        hasTitle: result.hasTitle,
        title: result.title,
        hasMetaDescription: result.hasMetaDescription,
        metaDescription: result.metaDescription,
        hasViewport: result.hasViewport,
        score: result.score,
      },
    });

    // Recalcula o score do lead considerando a análise
    const newLeadScore = this.scoringService.calculateScore({
      hasWebsite: lead.hasWebsite,
      phone: lead.phone,
      normalizedPhone: lead.normalizedPhone,
      whatsappStatus: lead.whatsappStatus,
      reviewCount: lead.reviewCount,
      rating: Number(lead.rating),
      websiteAnalysis: {
        isReachable: result.isReachable,
        isHttps: result.isHttps,
        responseTimeMs: result.responseTimeMs,
        hasMetaDescription: result.hasMetaDescription,
      },
    });

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score: newLeadScore.score },
    });

    // Registra na timeline do lead
    await this.prisma.leadHistory.create({
      data: {
        leadId,
        action: 'SITE_ANALISADO',
        description: `Website analisado: Score SEO ${result.score}/100, HTTPS: ${result.isHttps ? 'Sim' : 'Não'}, Tempo: ${result.responseTimeMs}ms`,
        metadata: result as any,
      },
    });

    return { analysis, leadScore: newLeadScore };
  }
}
