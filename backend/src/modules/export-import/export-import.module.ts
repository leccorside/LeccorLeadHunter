import { Module } from '@nestjs/common';
import { ExportImportService } from './export-import.service';
import { ExportImportController } from './export-import.controller';

@Module({
  controllers: [ExportImportController],
  providers: [ExportImportService],
  exports: [ExportImportService],
})
export class ExportImportModule {}
