import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Configurações')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obter todas as configurações do sistema' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar configurações em lote' })
  updateMany(@Body() body: Record<string, string>) {
    return this.settingsService.updateMany(body);
  }
}
