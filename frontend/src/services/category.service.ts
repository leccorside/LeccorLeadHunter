import api from './api';
import { Category } from '../types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res: any = await api.get('/categories');
    return res.data || res;
  },

  async createCategory(name: string, icon?: string): Promise<Category> {
    const res: any = await api.post('/categories', { name, icon });
    return res.data || res;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
