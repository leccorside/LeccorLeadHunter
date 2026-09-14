import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    service = new ScoringService();
  });

  it('deve atribuir score muito alto (>=80) para empresa sem site, com telefone e WhatsApp', () => {
    const result = service.calculateScore({
      hasWebsite: false,
      phone: '(64) 99999-1111',
      normalizedPhone: '5564999991111',
      whatsappStatus: 'VERIFIED',
      reviewCount: 35,
      rating: 4.5,
    });

    // 40 (sem site) + 10 (tem telefone) + 20 (whatsapp) + 10 (>20 avaliações) + 5 (rating >= 4) = 85
    expect(result.score).toBe(85);
    expect(result.classification).toBe('Muito alta');
    expect(result.factors.noWebsite).toBe(40);
    expect(result.factors.hasWhatsapp).toBe(20);
  });

  it('deve pontuar empresa com site ruim ou sem HTTPS (+15)', () => {
    const result = service.calculateScore({
      hasWebsite: true,
      phone: '(64) 99999-2222',
      normalizedPhone: '5564999992222',
      websiteAnalysis: {
        isHttps: false,
        responseTimeMs: 4000,
        hasMetaDescription: false,
      },
    });

    // 15 (site ruim) + 10 (telefone) + 20 (whatsapp) = 45
    expect(result.score).toBe(45);
    expect(result.classification).toBe('Média');
    expect(result.factors.badWebsite).toBe(15);
  });

  it('deve classificar oportunidade baixa quando tem site bom e poucos dados', () => {
    const result = service.calculateScore({
      hasWebsite: true,
      phone: null,
      reviewCount: 2,
      rating: 3.0,
      websiteAnalysis: {
        isHttps: true,
        responseTimeMs: 800,
        hasMetaDescription: true,
      },
    });

    expect(result.score).toBe(0);
    expect(result.classification).toBe('Baixa');
  });
});
