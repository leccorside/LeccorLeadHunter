import api from './api';

export const settingService = {
  async getSettings(): Promise<{ settings: any[]; dict: Record<string, string> }> {
    const res: any = await api.get('/settings');
    return res.data || res;
  },

  async updateSettings(settings: Record<string, string>): Promise<any> {
    const res: any = await api.patch('/settings', settings);
    return res.data || res;
  },

  async getHealth(): Promise<any> {
    const res: any = await api.get('/health');
    return res.data || res;
  },
};
