import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class StartSearchDto {
  @ApiProperty({ default: 'BR' })
  @IsString()
  country: string = 'BR';

  @ApiProperty({ example: 'Goiás' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'Caldas Novas' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'Restaurantes' })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  radiusKm?: number = 10;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(200)
  maxResults?: number = 50;

  @ApiPropertyOptional({ enum: ['GOOGLE_PLACES', 'OPENSTREETMAP'] })
  @IsOptional()
  @IsString()
  provider?: string;

  // Filtros Avançados
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  onlyWithoutWebsite?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  onlyWithPhone?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  onlyWithWhatsapp?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  onlyWithoutWhatsapp?: boolean = false;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minReviews?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxReviews?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxRating?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  excludeExisting?: boolean = true;
}
