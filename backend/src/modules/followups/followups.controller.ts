import { Controller, Get, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FollowUpsService } from './followups.service';

@ApiTags('Follow-ups')
@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os follow-ups' })
  findAll() {
    return this.followUpsService.findAll();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter follow-ups para o dashboard (hoje, atrasados e próximos)' })
  getDashboardFollowUps() {
    return this.followUpsService.getDashboardFollowUps();
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar follow-up como concluído' })
  complete(@Param('id') id: string) {
    return this.followUpsService.complete(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar um follow-up agendado' })
  cancel(@Param('id') id: string) {
    return this.followUpsService.cancel(id);
  }
}
