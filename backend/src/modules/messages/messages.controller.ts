import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@ApiTags('Mensagens & Templates')
@Controller('message-templates')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os templates de mensagem cadastrados' })
  findAll() {
    return this.messagesService.findAll();
  }

  @Get('preview')
  @ApiOperation({ summary: 'Gerar preview da mensagem interpolada com dados do lead e link do WhatsApp' })
  getPreview(
    @Query('templateId') templateId: string,
    @Query('leadId') leadId: string,
  ) {
    return this.messagesService.getPreview(templateId, leadId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um template de mensagem' })
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo template de mensagem' })
  create(@Body() dto: CreateTemplateDto) {
    return this.messagesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um template de mensagem' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    return this.messagesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um template de mensagem' })
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
