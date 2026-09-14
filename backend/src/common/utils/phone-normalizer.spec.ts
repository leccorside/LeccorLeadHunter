import { normalizePhone, buildWhatsAppLink } from './phone-normalizer';

describe('PhoneNormalizer Utility', () => {
  it('deve normalizar celular com 11 dígitos no padrão brasileiro', () => {
    const result = normalizePhone('(64) 99999-8888');
    expect(result.isValid).toBe(true);
    expect(result.isMobile).toBe(true);
    expect(result.e164).toBe('5564999998888');
    expect(result.formatted).toBe('(64) 99999-8888');
  });

  it('deve normalizar telefone fixo com 10 dígitos', () => {
    const result = normalizePhone('6434531234');
    expect(result.isValid).toBe(true);
    expect(result.isMobile).toBe(false);
    expect(result.e164).toBe('556434531234');
    expect(result.formatted).toBe('(64) 3453-1234');
  });

  it('deve tratar número já iniciado com DDI 55', () => {
    const result = normalizePhone('+55 (64) 98888-7777');
    expect(result.isValid).toBe(true);
    expect(result.isMobile).toBe(true);
    expect(result.e164).toBe('5564988887777');
  });

  it('deve retornar inválido para strings sem dígitos ou incompletas', () => {
    const result = normalizePhone('invalido');
    expect(result.isValid).toBe(false);
    expect(result.digits).toBe('');
  });

  it('deve gerar link correto do WhatsApp com mensagem codificada', () => {
    const link = buildWhatsAppLink('(64) 99999-8888', 'Olá mundo!');
    expect(link).toBe('https://wa.me/5564999998888?text=Ol%C3%A1%20mundo!');
  });
});
