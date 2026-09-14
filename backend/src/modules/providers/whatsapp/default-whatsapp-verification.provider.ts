import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppStatus } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from '../../../database/prisma.service';
import {
  IWhatsAppVerificationProvider,
  WhatsAppVerificationResult,
} from '../interfaces/whatsapp-verification.interface';
import { normalizePhone } from '../../../common/utils/phone-normalizer';

@Injectable()
export class DefaultWhatsAppVerificationProvider
  implements IWhatsAppVerificationProvider
{
  readonly name = 'DEFAULT_WHATSAPP_VERIFIER';
  private readonly logger = new Logger(DefaultWhatsAppVerificationProvider.name);

  constructor(private readonly prisma: PrismaService) {}

  async verify(phone: string): Promise<WhatsAppVerificationResult> {
    const normalized = normalizePhone(phone);

    // 1. Se o telefone não for válido ou ausente: classifica como NOT_FOUND
    if (!normalized.isValid || !normalized.e164) {
      return {
        status: WhatsAppStatus.NOT_FOUND,
        normalizedPhone: normalized.e164,
        isBusiness: false,
        verifiedAt: new Date(),
        details: 'Telefone ausente ou inválido',
      };
    }

    // 2. Se for telefone fixo (10 dígitos DDD + 2, 3, 4 ou 5):
    // No Brasil, telefones fixos normalmente não possuem WhatsApp
    if (!normalized.isMobile) {
      return {
        status: WhatsAppStatus.NOT_FOUND,
        normalizedPhone: normalized.e164,
        isBusiness: false,
        verifiedAt: new Date(),
        details: 'Telefone Fixo comercial/residencial (sem WhatsApp)',
      };
    }

    // 3. É celular brasileiro válido (+55 com 9º dígito)
    try {
      const settings = await this.prisma.setting.findMany({
        where: {
          key: {
            in: [
              'whatsapp_api_provider',
              'whatsapp_api_url',
              'whatsapp_api_key',
              'whatsapp_instance_name',
              'whatsapp_auto_verify_mobiles',
            ],
          },
        },
      });

      const configMap = new Map(settings.map((s) => [s.key, s.value]));
      const providerType = configMap.get('whatsapp_api_provider') || 'HEURISTIC';
      const apiUrl = configMap.get('whatsapp_api_url');
      const apiKey = configMap.get('whatsapp_api_key');
      const instance = configMap.get('whatsapp_instance_name');
      const autoVerify = configMap.get('whatsapp_auto_verify_mobiles') === 'true';

      // Verificação via Evolution API
      if (providerType === 'EVOLUTION_API' && apiUrl && apiKey && instance) {
        try {
          const checkUrl = `${apiUrl.replace(/\/$/, '')}/chat/whatsappNumbers/${instance}`;
          const res = await axios.post(
            checkUrl,
            { numbers: [normalized.digits] },
            {
              headers: { apikey: apiKey },
              timeout: 4000,
            },
          );

          const data = res.data;
          const found = Array.isArray(data) ? data[0] : data;
          if (found && (found.exists === true || found.isInWhatsapp === true)) {
            return {
              status: WhatsAppStatus.VERIFIED,
              normalizedPhone: normalized.e164,
              isBusiness: !!found.isBusiness,
              verifiedAt: new Date(),
              details: 'Verificado via Evolution API',
            };
          } else if (found && (found.exists === false || found.isInWhatsapp === false)) {
            return {
              status: WhatsAppStatus.NOT_FOUND,
              normalizedPhone: normalized.e164,
              isBusiness: false,
              verifiedAt: new Date(),
              details: 'Número celular não cadastrado no WhatsApp',
            };
          }
        } catch (apiErr: any) {
          this.logger.warn(`Falha na checagem via Evolution API: ${apiErr.message}`);
        }
      }

      // Verificação via Z-API
      if (providerType === 'Z_API' && apiUrl && apiKey && instance) {
        try {
          const checkUrl = `${apiUrl.replace(/\/$/, '')}/instances/${instance}/token/${apiKey}/phone-exists/${normalized.digits}`;
          const res = await axios.get(checkUrl, { timeout: 4000 });
          if (res.data?.exists === true) {
            return {
              status: WhatsAppStatus.VERIFIED,
              normalizedPhone: normalized.e164,
              isBusiness: false,
              verifiedAt: new Date(),
              details: 'Verificado via Z-API',
            };
          } else if (res.data?.exists === false) {
            return {
              status: WhatsAppStatus.NOT_FOUND,
              normalizedPhone: normalized.e164,
              isBusiness: false,
              verifiedAt: new Date(),
              details: 'Número não cadastrado no WhatsApp (confirmado pela Z-API)',
            };
          }
        } catch (apiErr: any) {
          this.logger.warn(`Falha na checagem via Z-API: ${apiErr.message}`);
        }
      }

      // Se autoVerify estiver ativado ou celular válido sem API externa
      return {
        status: autoVerify ? WhatsAppStatus.VERIFIED : WhatsAppStatus.UNKNOWN,
        normalizedPhone: normalized.e164,
        isBusiness: false,
        verifiedAt: new Date(),
        details: 'Celular válido identificado (+55 com 9º dígito)',
      };
    } catch {
      return {
        status: WhatsAppStatus.UNKNOWN,
        normalizedPhone: normalized.e164,
        isBusiness: false,
        verifiedAt: new Date(),
        details: 'Celular identificado',
      };
    }
  }
}
