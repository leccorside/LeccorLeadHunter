import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchProcessor } from './search.processor';
import { ProvidersModule } from '../providers/providers.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'lead-search',
    }),
    ProvidersModule,
    LeadsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchProcessor],
  exports: [SearchService, SearchProcessor],
})
export class SearchModule {}
