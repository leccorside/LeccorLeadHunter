import { WhatsAppStatus } from '@prisma/client';

export interface WhatsAppVerificationResult {
  status: WhatsAppStatus;
  normalizedPhone?: string;
  isBusiness?: boolean;
  verifiedAt: Date;
  details?: string;
}

export interface IWhatsAppVerificationProvider {
  readonly name: string;
  verify(phone: string): Promise<WhatsAppVerificationResult>;
}
