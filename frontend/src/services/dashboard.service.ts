import api from './api';
import { DashboardData } from '../types';

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const res: any = await api.get('/dashboard');
    return res.data || res;
  },
};
