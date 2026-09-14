import api from './api';
import { FollowUp } from '../types';

export const followUpService = {
  async getAll(): Promise<FollowUp[]> {
    const res: any = await api.get('/follow-ups');
    return res.data || res;
  },

  async getDashboardFollowUps(): Promise<{
    overdue: FollowUp[];
    today: FollowUp[];
    upcoming: FollowUp[];
    totalPending: number;
  }> {
    const res: any = await api.get('/follow-ups/dashboard');
    return res.data || res;
  },

  async complete(id: string): Promise<FollowUp> {
    const res: any = await api.patch(`/follow-ups/${id}/complete`);
    return res.data || res;
  },

  async cancel(id: string): Promise<FollowUp> {
    const res: any = await api.patch(`/follow-ups/${id}/cancel`);
    return res.data || res;
  },
};
