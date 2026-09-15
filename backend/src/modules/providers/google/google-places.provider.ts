import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  ISearchProvider,
  RawLeadResult,
  SearchQuery,
} from '../interfaces/search-provider.interface';

export const GOOGLE_TYPE_TO_CATEGORY: Record<string, string> = {
  restaurant: 'Restaurantes',
  food: 'Restaurantes',
  meal_delivery: 'Restaurantes',
  meal_takeaway: 'Restaurantes',
  cafe: 'Restaurantes',
  bakery: 'Restaurantes',
  bar: 'Bares',
  night_club: 'Bares',
  dentist: 'Dentistas',
  dental_clinic: 'Dentistas',
  doctor: 'Clínicas',
  health: 'Clínicas',
  hospital: 'Clínicas',
  physiotherapist: 'Clínicas',
  medical_lab: 'Clínicas',
  pharmacy: 'Clínicas',
  lawyer: 'Advogados',
  legal_services: 'Advogados',
  gym: 'Academias',
  fitness_center: 'Academias',
  beauty_salon: 'Salões de beleza',
  hair_care: 'Salões de beleza',
  hair_salon: 'Salões de beleza',
  spa: 'Salões de beleza',
  barber_shop: 'Barbearias',
  supermarket: 'Mercados',
  grocery_or_supermarket: 'Mercados',
  convenience_store: 'Mercados',
  store: 'Lojas',
  clothing_store: 'Lojas',
  shoe_store: 'Lojas',
  furniture_store: 'Lojas',
  home_goods_store: 'Lojas',
  electronics_store: 'Lojas',
  car_repair: 'Oficinas',
  auto_repair: 'Oficinas',
  car_dealer: 'Oficinas',
  lodging: 'Hotéis',
  hotel: 'Hotéis',
  motel: 'Hotéis',
  real_estate_agency: 'Imobiliárias',
  accounting: 'Contadores',
  veterinary_care: 'Veterinários',
  pet_store: 'Pet Shops',
  general_contractor: 'Construção',
  roofing_contractor: 'Construção',
  electrician: 'Eletricistas',
  plumber: 'Encanadores',
  school: 'Escolas',
  primary_school: 'Escolas',
  secondary_school: 'Escolas',
  university: 'Cursos',
};

export function mapGoogleCategory(types?: string[], fallbackCategory?: string): string {
  if (types && Array.isArray(types)) {
    for (const type of types) {
      const mapped = GOOGLE_TYPE_TO_CATEGORY[type.toLowerCase()];
      if (mapped) return mapped;
    }
  }
  if (
    fallbackCategory &&
    fallbackCategory !== 'Todas as categorias' &&
    fallbackCategory !== 'Comércio Local'
  ) {
    return fallbackCategory;
  }
  return 'Lojas';
}

const DIVERSE_CATEGORIES = [
  'Restaurantes',
  'Salões de beleza',
  'Clínicas',
  'Dentistas',
  'Academias',
  'Oficinas mecânicas',
  'Barbearias',
  'Pet shops',
  'Imobiliárias',
  'Lojas',
];

@Injectable()
export class GooglePlacesProvider implements ISearchProvider {
  readonly name = 'GOOGLE_PLACES';
  private readonly logger = new Logger(GooglePlacesProvider.name);
  private readonly clientLegacy: AxiosInstance;
  private readonly clientNew: AxiosInstance;

  constructor() {
    this.clientLegacy = axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api/place',
      timeout: 10000,
    });
    this.clientNew = axios.create({
      baseURL: 'https://places.googleapis.com/v1',
      timeout: 12000,
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

    const isAllCategories =
      !query.category ||
      query.category === 'Todas as categorias' ||
      query.category === 'Comércio Local';

    const maxResults = query.maxResults || 50;

    // Quando o usuário seleciona "Todas as categorias", pesquisa nichos comerciais reais diversificados
    if (isAllCategories) {
      this.logger.log(
        `Pesquisa ampla ("Todas as categorias") solicitada para ${query.city} - ${query.state}. Distribuindo busca entre principais nichos locais...`,
      );

      const allResults: RawLeadResult[] = [];
      const seenIds = new Set<string>();
      const perCatLimit = Math.max(5, Math.ceil(maxResults / DIVERSE_CATEGORIES.length));

      for (const catName of DIVERSE_CATEGORIES) {
        if (allResults.length >= maxResults) break;

        const subQuery: SearchQuery = {
          ...query,
          category: catName,
          maxResults: perCatLimit,
        };

        try {
          const catResults = await this.searchSingleCategory(subQuery, apiKey, perCatLimit);
          for (const r of catResults) {
            if (!seenIds.has(r.providerPlaceId)) {
              seenIds.add(r.providerPlaceId);
              allResults.push(r);
              if (allResults.length >= maxResults) break;
            }
          }
        } catch (e: any) {
          this.logger.warn(`Erro na busca do nicho ${catName}: ${e.message}`);
        }
      }

      this.logger.log(
        `Busca ampla concluída: ${allResults.length} empresas locais encontradas em múltiplos nichos.`,
      );
      return allResults;
    }

    return this.searchSingleCategory(query, apiKey, maxResults);
  }

  private async searchSingleCategory(
    query: SearchQuery,
    apiKey: string,
    maxResults: number,
  ): Promise<RawLeadResult[]> {
    const categoryTerm = query.category || query.keyword || 'empresas locais';
    const textQuery = `${categoryTerm} em ${query.city}, ${query.state}, ${query.country || 'Brasil'}`;

    this.logger.log(`Iniciando busca no Google Places: "${textQuery}" (Limite: ${maxResults})`);

    // 1. TENTA PRIMEIRO VIA PLACES API (NEW) - Formato moderno e oficial do Google
    try {
      const resultsNew = await this.searchPlacesNew(textQuery, apiKey, maxResults, query);
      if (resultsNew && resultsNew.length > 0) {
        this.logger.log(`Google Places (New) retornou ${resultsNew.length} resultados.`);
        return resultsNew;
      }
    } catch (newErr: any) {
      this.logger.warn(`Tentativa via Places API (New) falhou: ${newErr.message}. Tentando endpoint Legacy...`);
    }

    // 2. FALLBACK PARA PLACES API (LEGACY)
    try {
      const resultsLegacy = await this.searchPlacesLegacy(textQuery, apiKey, maxResults, query);
      if (resultsLegacy && resultsLegacy.length > 0) {
        this.logger.log(`Google Places (Legacy) retornou ${resultsLegacy.length} resultados.`);
        return resultsLegacy;
      }
    } catch (legacyErr: any) {
      this.logger.error(`Tentativa via Places API Legacy falhou: ${legacyErr.message}`);
    }

    return [];
  }

  /**
   * Busca utilizando a nova Places API v1 (searchText)
   */
  private async searchPlacesNew(
    textQuery: string,
    apiKey: string,
    maxResults: number,
    query: SearchQuery,
  ): Promise<RawLeadResult[]> {
    const results: RawLeadResult[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const requestBody: any = {
        textQuery,
        languageCode: 'pt-BR',
        pageSize: Math.min(20, maxResults - results.length),
      };

      if (pageToken) {
        requestBody.pageToken = pageToken;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      const response = await this.clientNew.post(
        '/places:searchText',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.googleMapsUri,places.location,places.regularOpeningHours,places.businessStatus,places.types,nextPageToken',
          },
        },
      );

      const data = response.data;
      const places = data.places || [];

      for (const p of places) {
        if (results.length >= maxResults) break;

        const website = p.websiteUri || undefined;
        const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || null;
        const name = p.displayName?.text || 'Sem nome';

        results.push({
          provider: this.name,
          providerPlaceId: p.id || `google_${Math.random()}`,
          name,
          category: mapGoogleCategory(p.types, query.category),
          phone,
          website,
          hasWebsite: !!website,
          address: p.formattedAddress,
          city: query.city,
          state: query.state,
          country: query.country || 'BR',
          latitude: p.location?.latitude,
          longitude: p.location?.longitude,
          googleMapsUrl: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + query.city)}`,
          rating: p.rating,
          reviewCount: p.userRatingCount || 0,
          openingHours: p.regularOpeningHours?.weekdayDescriptions?.join(' | '),
          businessStatus: p.businessStatus || 'OPERATIONAL',
        });
      }

      pageToken = data.nextPageToken;
    } while (pageToken && results.length < maxResults);

    return results;
  }

  /**
   * Busca utilizando o endpoint legado da Places API
   */
  private async searchPlacesLegacy(
    textQuery: string,
    apiKey: string,
    maxResults: number,
    query: SearchQuery,
  ): Promise<RawLeadResult[]> {
    const results: RawLeadResult[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const params: Record<string, any> = {
        query: textQuery,
        key: apiKey,
        language: 'pt-BR',
      };

      if (pageToken) {
        params.pagetoken = pageToken;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const response = await this.clientLegacy.get('/textsearch/json', { params });
      const data = response.data;

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        this.logger.error(
          `Google Places Legacy retornou status: ${data.status} - ${data.error_message || ''}`,
        );
        break;
      }

      if (data.results && Array.isArray(data.results)) {
        for (const place of data.results) {
          if (results.length >= maxResults) break;

          const details = await this.fetchPlaceDetailsLegacy(place.place_id, apiKey);

          results.push({
            provider: this.name,
            providerPlaceId: place.place_id,
            name: details?.name || place.name,
            category: mapGoogleCategory(place.types, query.category),
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

          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      pageToken = data.next_page_token;
    } while (pageToken && results.length < maxResults);

    return results;
  }

  private async fetchPlaceDetailsLegacy(placeId: string, apiKey: string): Promise<any | null> {
    try {
      const response = await this.clientLegacy.get('/details/json', {
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
      this.logger.warn(`Falha ao buscar detalhes do place_id ${placeId}: ${error.message}`);
      return null;
    }
  }
}
