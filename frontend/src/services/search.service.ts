import api from './api';
import { Search } from '../types';

export interface StartSearchPayload {
  country?: string;
  state: string;
  city: string;
  categoryName?: string;
  categoryId?: string;
  radiusKm?: number;
  maxResults?: number;
  provider?: string;
  onlyWithoutWebsite?: boolean;
  onlyWithPhone?: boolean;
  onlyWithWhatsapp?: boolean;
  onlyWithoutWhatsapp?: boolean;
  minReviews?: number;
  maxReviews?: number;
  minRating?: number;
  maxRating?: number;
  excludeExisting?: boolean;
}

export const searchService = {
  async startSearch(payload: StartSearchPayload): Promise<Search> {
    const res: any = await api.post('/searches', payload);
    return res.data || res;
  },

  async getProgress(searchId: string): Promise<Search> {
    const res: any = await api.get(`/searches/${searchId}`);
    return res.data || res;
  },

  async cancelSearch(searchId: string): Promise<Search> {
    const res: any = await api.post(`/searches/${searchId}/cancel`);
    return res.data || res;
  },

  async getHistory(): Promise<Search[]> {
    const res: any = await api.get('/searches');
    return res.data || res;
  },
};
