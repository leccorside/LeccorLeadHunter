import {
  Controller,
  Post,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { StartSearchDto } from './dto/start-search.dto';

@ApiTags('Buscas')
@Controller('searches')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({ summary: 'Iniciar uma nova busca assíncrona de empresas na fila BullMQ' })
  startSearch(@Body() startSearchDto: StartSearchDto) {
    return this.searchService.startSearch(startSearchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar histórico de buscas recentes' })
  findAll() {
    return this.searchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar status e progresso em tempo real de uma busca' })
  getSearchProgress(@Param('id') id: string) {
    return this.searchService.getSearchProgress(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar uma busca em andamento' })
  cancelSearch(@Param('id') id: string) {
    return this.searchService.cancelSearch(id);
  }
}
