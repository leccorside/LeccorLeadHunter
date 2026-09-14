import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar leads com filtros avançados e paginação' })
  findAll(@Query() query: QueryLeadDto) {
    return this.leadsService.findAll(query);
  }

  @Get('kanban')
  @ApiOperation({ summary: 'Obter leads organizados em colunas para visualização Kanban' })
  getKanbanData() {
    return this.leadsService.getKanbanData();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes completos de um lead específico' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar manualmente um novo lead' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de um lead existente' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete('batch/clear-all')
  @ApiOperation({ summary: 'Limpar todos os leads cadastrados' })
  clearAll() {
    return this.leadsService.clearAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um lead do banco de dados' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Adicionar anotação/observação a um lead' })
  addNote(@Param('id') id: string, @Body('note') note: string) {
    return this.leadsService.addNote(id, note);
  }

  @Post(':id/follow-up')
  @ApiOperation({ summary: 'Agendar follow-up com data e motivo' })
  addFollowUp(
    @Param('id') id: string,
    @Body('scheduledFor') scheduledFor: string,
    @Body('reason') reason: string,
  ) {
    return this.leadsService.addFollowUp(id, scheduledFor, reason);
  }

  @Post(':id/contact')
  @ApiOperation({ summary: 'Registrar histórico de contato realizado' })
  recordContact(
    @Param('id') id: string,
    @Body('type') type: 'WHATSAPP' | 'EMAIL' | 'PHONE' | 'IN_PERSON',
    @Body('messageText') messageText: string,
    @Body('messageTemplateId') messageTemplateId?: string,
  ) {
    return this.leadsService.recordContact(id, type, messageText, messageTemplateId);
  }
}
