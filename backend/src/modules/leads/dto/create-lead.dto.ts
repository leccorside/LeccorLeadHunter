import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeadStatus, WhatsAppStatus } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty({ example: 'Restaurante Sabor do Cerrado' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Sabor do Cerrado LTDA' })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: '(64) 99999-8888' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contato@sabordocerrado.com.br' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://sabordocerrado.com.br' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasWebsite?: boolean;

  @ApiPropertyOptional({ example: 'Av. Santo Amaro, 120' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Caldas Novas' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Goiás' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ default: 'BR' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '75690-000' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: -17.7444 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -48.6253 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 4.6 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ example: 84 })
  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @ApiPropertyOptional({ enum: LeadStatus, default: LeadStatus.NOVO })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: WhatsAppStatus, default: WhatsAppStatus.UNKNOWN })
  @IsOptional()
  @IsEnum(WhatsAppStatus)
  whatsappStatus?: WhatsAppStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerPlaceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
