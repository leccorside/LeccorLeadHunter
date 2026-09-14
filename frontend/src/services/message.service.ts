import api from './api';
import { MessageTemplate } from '../types';

export const messageService = {
  async getTemplates(): Promise<MessageTemplate[]> {
    const res: any = await api.get('/message-templates');
    return res.data || res;
  },

  async createTemplate(data: {
    name: string;
    content: string;
    categoryId?: string;
  }): Promise<MessageTemplate> {
    const res: any = await api.post('/message-templates', data);
    return res.data || res;
  },

  async updateTemplate(id: string, data: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const res: any = await api.patch(`/message-templates/${id}`, data);
    return res.data || res;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/message-templates/${id}`);
  },

  async getPreview(templateId: string, leadId: string) {
    const res: any = await api.get(
      `/message-templates/preview?templateId=${templateId}&leadId=${leadId}`,
    );
    return res.data || res;
  },
};
