import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface ScoreBreakdown {
  score: number;
  classification: 'Muito alta' | 'Alta' | 'Média' | 'Baixa';
  factors: {
    noWebsite: number;
    hasPhone: number;
    hasWhatsapp: number;
    reviewsOver20: number;
    reviewsOver100: number;
    goodRating: number;
    badWebsite: number;
  };
}

export interface LeadScoreInput {
  hasWebsite?: boolean;
  phone?: string | null;
  normalizedPhone?: string | null;
  whatsapp?: string | null;
  whatsappStatus?: string | null;
  reviewCount?: number | null;
  rating?: number | null;
  websiteAnalysis?: {
    isReachable?: boolean;
    isHttps?: boolean;
    responseTimeMs?: number | null;
    hasMetaDescription?: boolean;
  } | null;
}

@Injectable()
export class ScoringService {
  constructor(private readonly prisma?: PrismaService) {}

  calculateScore(lead: LeadScoreInput): ScoreBreakdown {
    let score = 0;
    const factors = {
      noWebsite: 0,
      hasPhone: 0,
      hasWhatsapp: 0,
      reviewsOver20: 0,
      reviewsOver100: 0,
      goodRating: 0,
      badWebsite: 0,
    };

    // 1. Sem site (+40 pontos de oportunidade comercial para vender site)
    if (!lead.hasWebsite) {
      factors.noWebsite = 40;
      score += 40;
    } else if (lead.websiteAnalysis) {
      // 2. Possui site mas é ruim/lento/sem HTTPS/sem meta description (+15)
      const wa = lead.websiteAnalysis;
      if (!wa.isHttps || (wa.responseTimeMs && wa.responseTimeMs > 3000) || !wa.hasMetaDescription) {
        factors.badWebsite = 15;
        score += 15;
      }
    }

    // 3. Possui telefone (+10 pontos)
    if (lead.phone && lead.phone.trim().length > 5) {
      factors.hasPhone = 10;
      score += 10;
    }

    // 4. Possui WhatsApp (+20 pontos)
    const hasWhatsappIdentified =
      lead.whatsapp ||
      lead.whatsappStatus === 'VERIFIED' ||
      (lead.normalizedPhone && lead.normalizedPhone.length >= 12);
    if (hasWhatsappIdentified) {
      factors.hasWhatsapp = 20;
      score += 20;
    }

    // 5. Quantidade de avaliações (prova que a empresa está ativa e tem clientes)
    const reviewCount = lead.reviewCount || 0;
    if (reviewCount > 100) {
      factors.reviewsOver20 = 10;
      factors.reviewsOver100 = 10;
      score += 20;
    } else if (reviewCount > 20) {
      factors.reviewsOver20 = 10;
      score += 10;
    }

    // 6. Nota média boa (acima de 4.0 indica negócio respeitado que preza pela qualidade)
    const rating = Number(lead.rating) || 0;
    if (rating >= 4.0) {
      factors.goodRating = 5;
      score += 5;
    }

    // Limita entre 0 e 100
    const finalScore = Math.min(100, Math.max(0, score));

    let classification: 'Muito alta' | 'Alta' | 'Média' | 'Baixa' = 'Baixa';
    if (finalScore >= 80) {
      classification = 'Muito alta';
    } else if (finalScore >= 60) {
      classification = 'Alta';
    } else if (finalScore >= 40) {
      classification = 'Média';
    }

    return {
      score: finalScore,
      classification,
      factors,
    };
  }
}
