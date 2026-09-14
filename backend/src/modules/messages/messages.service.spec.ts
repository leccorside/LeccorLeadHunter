import { MessagesService } from './messages.service';

describe('MessagesService Interpolation', () => {
  let service: MessagesService;

  beforeEach(() => {
    service = new MessagesService({} as any);
  });

  it('deve substituir corretamente as variáveis do template de WhatsApp', () => {
    const template =
      'Olá {{nome}}, vi que a empresa {{empresa}} em {{cidade}} - {{estado}} do segmento {{categoria}} ainda não tem site ({{site}}).';

    const lead = {
      name: 'Pizzaria Bella',
      city: 'Caldas Novas',
      state: 'Goiás',
      category: { name: 'Restaurantes' },
      website: null,
      phone: '(64) 99999-0000',
    };

    const interpolated = service.interpolateTemplate(template, lead);

    expect(interpolated).toContain('Pizzaria Bella');
    expect(interpolated).toContain('Caldas Novas');
    expect(interpolated).toContain('Goiás');
    expect(interpolated).toContain('Restaurantes');
    expect(interpolated).toContain('sem site');
  });
});
