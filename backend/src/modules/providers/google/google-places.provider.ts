import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  ISearchProvider,
  RawLeadResult,
  SearchQuery,
} from '../interfaces/search-provider.interface';

@Injectable()
export class GooglePlacesProvider implements ISearchProvider {
  readonly name = 'GOOGLE_PLACES';
  private readonly logger = new Logger(GooglePlacesProvider.name);
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api/place',
      timeout: 10000,
    });
  }

  async search(query: SearchQuery): Promise<RawLeadResult[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY não configurada no backend. Provedor Google Places inativo.',
      );
      return [];
    }

    const categoryTerm = query.category || query.keyword || 'empresas';
    const textQuery = `${categoryTerm} em ${query.city}, ${query.state}, ${query.country || 'Brasil'}`;

    this.logger.log(`Iniciando busca no Google Places: "${textQuery}"`);

    try {
      const results: RawLeadResult[] = [];
      let pageToken: string | undefined = undefined;
      const maxResults = query.maxResults || 50;

      do {
        // Text Search
        const params: Record<string, any> = {
          query: textQuery,
          key: apiKey,
          language: 'pt-BR',
        };

        if (pageToken) {
          params.pagetoken = pageToken;
          // Aguarda 2 segundos exigidos pelo Google antes de usar pageToken
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        const response = await this.client.get('/textsearch/json', { params });
        const data = response.data;

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          this.logger.error(
            `Google Places API retornou status: ${data.status} - ${data.error_message || ''}`,
          );
          break;
        }

        if (data.results && Array.isArray(data.results)) {
          for (const place of data.results) {
            if (results.length >= maxResults) break;

            // Busca detalhes para telefone e site se disponíveis
            const details = await this.fetchPlaceDetails(place.place_id, apiKey);

            results.push({
              provider: this.name,
              providerPlaceId: place.place_id,
              name: details?.name || place.name,
              category: query.category || (place.types && place.types[0]),
              phone: details?.formatted_phone_number || details?.international_phone_number,
              website: details?.website,
              hasWebsite: !!details?.website,
              address: details?.formatted_address || place.formatted_address,
              city: query.city,
              state: query.state,
              country: query.country || 'BR',
              latitude: place.geometry?.location?.lat,
              longitude: place.geometry?.location?.lng,
              googleMapsUrl: details?.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
              rating: place.rating,
              reviewCount: place.user_ratings_total || 0,
              openingHours: details?.opening_hours?.weekday_text?.join(' | '),
              businessStatus: place.business_status,
            });

            // Respeita limite de chamadas com pequeno delay
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        }

        pageToken = data.next_page_token;
      } while (pageToken && results.length < maxResults);

      this.logger.log(`Google Places retornou ${results.length} resultados.`);
      return results;
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar no Google Places: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async fetchPlaceDetails(placeId: string, apiKey: string): Promise<any | null> {
    try {
      const response = await this.client.get('/details/json', {
        params: {
          place_id: placeId,
          fields:
            'name,formatted_phone_number,international_phone_number,website,formatted_address,url,opening_hours',
          key: apiKey,
          language: 'pt-BR',
        },
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }
      return null;
    } catch (error: any) {
      this.logger.warn(
        `Falha ao buscar detalhes do place_id ${placeId}: ${error.message}`,
      );
      return null;
    }
  }
}
