import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportImportService } from './export-import.service';
import { QueryLeadDto } from '../leads/dto/query-lead.dto';

@ApiTags('Exportação')
@Controller('export')
export class ExportImportController {
  constructor(private readonly exportService: ExportImportService) {}

  @Get('excel')
  @ApiOperation({ summary: 'Exportar leads filtrados para arquivo Excel (.xlsx)' })
  async exportExcel(@Query() query: QueryLeadDto, @Res() res: Response) {
    const buffer = await this.exportService.exportToExcel(query);
    const filename = `leadhunter-leads-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('csv')
  @ApiOperation({ summary: 'Exportar leads filtrados para arquivo CSV' })
  async exportCsv(@Query() query: QueryLeadDto, @Res() res: Response) {
    const csv = await this.exportService.exportToCsv(query);
    const filename = `leadhunter-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // Inclui BOM para acentuação correta no Excel brasileiro
  }
}
