import api from './api';
import { Lead, PaginatedResponse, LeadStatus } from '../types';

export interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  categoryId?: string;
  hasWebsite?: string;
  hasWhatsapp?: string;
  minRating?: number;
  maxRating?: number;
  minReviews?: number;
  maxReviews?: number;
  minScore?: number;
  maxScore?: number;
  status?: LeadStatus;
  favorite?: string;
  isContacted?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const leadService = {
  async getLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        params.append(key, String(val));
      }
    });
    return api.get(`/leads?${params.toString()}`);
  },

  async getLead(id: string): Promise<Lead> {
    const res: any = await api.get(`/leads/${id}`);
    return res.data || res;
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const res: any = await api.patch(`/leads/${id}`, data);
    return res.data || res;
  },

  async deleteLead(id: string): Promise<void> {
    await api.delete(`/leads/${id}`);
  },

  async clearAllLeads(): Promise<void> {
    await api.delete('/leads/batch/clear-all');
  },

  async getKanban(): Promise<Record<LeadStatus, Lead[]>> {
    const res: any = await api.get('/leads/kanban');
    return res.data || res;
  },

  async addNote(id: string, note: string) {
    const res: any = await api.post(`/leads/${id}/notes`, { note });
    return res.data || res;
  },

  async addFollowUp(id: string, scheduledFor: string, reason: string) {
    const res: any = await api.post(`/leads/${id}/follow-up`, { scheduledFor, reason });
    return res.data || res;
  },

  async recordContact(
    id: string,
    type: 'WHATSAPP' | 'EMAIL' | 'PHONE' | 'IN_PERSON',
    messageText: string,
    messageTemplateId?: string,
  ) {
    const res: any = await api.post(`/leads/${id}/contact`, {
      type,
      messageText,
      messageTemplateId,
    });
    return res.data || res;
  },

  async analyzeWebsite(leadId: string) {
    const res: any = await api.post(`/website-analysis/lead/${leadId}`);
    return res.data || res;
  },

  getExportUrl(type: 'excel' | 'csv', filters: LeadFilters = {}): string {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && key !== 'page' && key !== 'limit') {
        params.append(key, String(val));
      }
    });
    return `${baseUrl}/export/${type}?${params.toString()}`;
  },
};
