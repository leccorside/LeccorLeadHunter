import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { ScoringService } from './services/scoring.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, ScoringService],
  exports: [LeadsService, ScoringService],
})
export class LeadsModule {}
