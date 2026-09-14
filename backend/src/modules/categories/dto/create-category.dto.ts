import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Energia Solar' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Sun' })
  @IsOptional()
  @IsString()
  icon?: string;
}
