export interface RawLeadResult {
  provider: string;
  providerPlaceId: string;
  name: string;
  tradeName?: string;
  category?: string;
  phone?: string;
  email?: string;
  website?: string;
  hasWebsite: boolean;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  businessStatus?: string;
  description?: string;
  photos?: string[];
}

export interface SearchQuery {
  country: string;
  state: string;
  city: string;
  category?: string;
  radiusKm?: number;
  maxResults?: number;
  keyword?: string;
}

export interface ISearchProvider {
  readonly name: string;
  search(query: SearchQuery): Promise<RawLeadResult[]>;
}
