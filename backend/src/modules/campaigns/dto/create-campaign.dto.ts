import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Restaurantes sem site em Caldas Novas' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Prospecção ativa de restaurantes da região turística' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  filtersJson?: any;
}
