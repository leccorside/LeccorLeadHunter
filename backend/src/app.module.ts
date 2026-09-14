import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from './database/database.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { SearchModule } from './modules/search/search.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { FollowUpsModule } from './modules/followups/followups.module';
import { WebsiteAnalysisModule } from './modules/website-analysis/website-analysis.module';
import { SettingsModule } from './modules/settings/settings.module';
import { LocationsModule } from './modules/locations/locations.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ExportImportModule } from './modules/export-import/export-import.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    DatabaseModule,
    ProvidersModule,
    LeadsModule,
    SearchModule,
    CategoriesModule,
    CampaignsModule,
    MessagesModule,
    ContactsModule,
    FollowUpsModule,
    WebsiteAnalysisModule,
    SettingsModule,
    LocationsModule,
    DashboardModule,
    ExportImportModule,
    HealthModule,
  ],
})
export class AppModule {}
