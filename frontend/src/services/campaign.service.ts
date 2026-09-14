import api from './api';
import { Campaign } from '../types';

export const campaignService = {
  async getCampaigns(): Promise<Campaign[]> {
    const res: any = await api.get('/campaigns');
    return res.data || res;
  },

  async createCampaign(data: { name: string; description?: string; filtersJson?: any }): Promise<Campaign> {
    const res: any = await api.post('/campaigns', data);
    return res.data || res;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },
};
