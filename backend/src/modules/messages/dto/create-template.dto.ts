import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Apresentação Comercial' })
  @IsString()
  name: string;

  @ApiProperty({
    example:
      'Olá {{nome}}, tudo bem? Encontrei a {{empresa}} em {{cidade}} e gostaria de apresentar uma solução para a presença digital da empresa.',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
