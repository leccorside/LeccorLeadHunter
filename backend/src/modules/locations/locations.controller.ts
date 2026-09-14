import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('Localizações')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('states')
  @ApiOperation({ summary: 'Listar todos os estados do Brasil' })
  getStates() {
    return this.locationsService.getStates();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Buscar cidades filtradas por estado ou nome' })
  getCities(
    @Query('state') state?: string,
    @Query('q') query?: string,
  ) {
    return this.locationsService.getCities(state, query);
  }
}
