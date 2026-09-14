import { Injectable } from '@nestjs/common';
import { WhatsAppStatus } from '@prisma/client';
import {
  IWhatsAppVerificationProvider,
  WhatsAppVerificationResult,
} from '../interfaces/whatsapp-verification.interface';
import { normalizePhone } from '../../../common/utils/phone-normalizer';

@Injectable()
export class DefaultWhatsAppVerificationProvider
  implements IWhatsAppVerificationProvider
{
  readonly name = 'DEFAULT_HEURISTIC';

  async verify(phone: string): Promise<WhatsAppVerificationResult> {
    const normalized = normalizePhone(phone);

    if (!normalized.isValid) {
      return {
        status: WhatsAppStatus.NOT_FOUND,
        normalizedPhone: normalized.e164,
        isBusiness: false,
        verifiedAt: new Date(),
        details: 'Número inválido ou incompleto',
      };
    }

    // No Brasil, celulares têm 11 dígitos com o nono dígito iniciando em 9
    // Como ainda não há provider oficial de verificação conectado (ex: Z-API / Evolution),
    // marcamos como UNKNOWN para celular para exibir '?' na interface conforme especificado,
    // e NOT_FOUND para telefones fixos (10 dígitos não móveis).
    const status = normalized.isMobile
      ? WhatsAppStatus.UNKNOWN
      : WhatsAppStatus.NOT_FOUND;

    return {
      status,
      normalizedPhone: normalized.e164,
      isBusiness: false,
      verifiedAt: new Date(),
      details: normalized.isMobile
        ? 'Número de celular identificado. Aguardando verificação via API oficial.'
        : 'Telefone fixo - probabilidade baixa de WhatsApp.',
    };
  }
}
