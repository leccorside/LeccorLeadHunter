import { Module } from '@nestjs/common';
import { WebsiteAnalyzerService } from './website-analyzer.service';
import { WebsiteAnalysisController } from './website-analysis.controller';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [LeadsModule],
  controllers: [WebsiteAnalysisController],
  providers: [WebsiteAnalyzerService],
  exports: [WebsiteAnalyzerService],
})
export class WebsiteAnalysisModule {}
