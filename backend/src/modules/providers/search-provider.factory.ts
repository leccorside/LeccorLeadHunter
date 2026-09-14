import { Injectable, Logger } from '@nestjs/common';
import { ISearchProvider } from './interfaces/search-provider.interface';
import { GooglePlacesProvider } from './google/google-places.provider';
import { OverpassProvider } from './osm/overpass.provider';

@Injectable()
export class SearchProviderFactory {
  private readonly logger = new Logger(SearchProviderFactory.name);

  constructor(
    private readonly googlePlacesProvider: GooglePlacesProvider,
    private readonly overpassProvider: OverpassProvider,
  ) {}

  getProvider(providerName?: string): ISearchProvider {
    if (providerName === 'OPENSTREETMAP') {
      return this.overpassProvider;
    }

    if (providerName === 'GOOGLE_PLACES') {
      if (process.env.GOOGLE_MAPS_API_KEY) {
        return this.googlePlacesProvider;
      }
      this.logger.warn(
        'Google Places solicitado mas GOOGLE_MAPS_API_KEY está vazia. Utilizando OpenStreetMap como fallback.',
      );
      return this.overpassProvider;
    }

    // Padrão: Se tiver chave da Google API usa Google Places, senão Overpass
    if (process.env.GOOGLE_MAPS_API_KEY) {
      return this.googlePlacesProvider;
    }

    return this.overpassProvider;
  }
}
