import { Module } from '@nestjs/common';
import { GooglePlacesProvider } from './google/google-places.provider';
import { OverpassProvider } from './osm/overpass.provider';
import { DefaultWhatsAppVerificationProvider } from './whatsapp/default-whatsapp-verification.provider';
import { SearchProviderFactory } from './search-provider.factory';

@Module({
  providers: [
    GooglePlacesProvider,
    OverpassProvider,
    DefaultWhatsAppVerificationProvider,
    SearchProviderFactory,
  ],
  exports: [
    GooglePlacesProvider,
    OverpassProvider,
    DefaultWhatsAppVerificationProvider,
    SearchProviderFactory,
  ],
})
export class ProvidersModule {}
