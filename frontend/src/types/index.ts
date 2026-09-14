export type LeadStatus =
  | 'NOVO'
  | 'NAO_CONTATADO'
  | 'CONTATADO'
  | 'RESPONDEU'
  | 'INTERESSADO'
  | 'NEGOCIACAO'
  | 'CLIENTE'
  | 'SEM_INTERESSE'
  | 'FOLLOW_UP'
  | 'ARQUIVADO';

export type WhatsAppStatus = 'UNKNOWN' | 'VERIFIED' | 'NOT_FOUND';

export type SearchStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  isCustom: boolean;
  _count?: {
    leads: number;
  };
}

export interface WebsiteAnalysis {
  id: string;
  leadId: string;
  isReachable: boolean;
  isHttps: boolean;
  statusCode?: number;
  responseTimeMs?: number;
  hasTitle: boolean;
  title?: string;
  hasMetaDescription: boolean;
  metaDescription?: string;
  hasViewport: boolean;
  score: number;
  analyzedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  note: string;
  createdAt: string;
}

export interface LeadHistory {
  id: string;
  leadId: string;
  action: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface Contact {
  id: string;
  leadId: string;
  type: 'WHATSAPP' | 'EMAIL' | 'PHONE' | 'IN_PERSON';
  messageTemplateId?: string;
  messageTemplate?: {
    id: string;
    name: string;
  };
  messageText: string;
  sentAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    normalizedPhone?: string;
    city?: string;
    status: LeadStatus;
  };
  scheduledFor: string;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  provider: string;
  providerPlaceId?: string;
  name: string;
  tradeName?: string;
  categoryId?: string;
  category?: Category;
  phone?: string;
  normalizedPhone?: string;
  whatsapp?: string;
  whatsappStatus: WhatsAppStatus;
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
  score: number;
  status: LeadStatus;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  contacts?: Contact[];
  notes?: LeadNote[];
  history?: LeadHistory[];
  followUps?: FollowUp[];
  websiteAnalysis?: WebsiteAnalysis;
  _count?: {
    contacts: number;
    notes: number;
  };
}

export interface Search {
  id: string;
  provider: string;
  country: string;
  state: string;
  city: string;
  categoryId?: string;
  category?: Category;
  radiusKm: number;
  maxResults: number;
  filtersJson?: any;
  status: SearchStatus;
  totalFound: number;
  processedCount: number;
  newLeadsCount: number;
  duplicateCount: number;
  noPhoneCount: number;
  whatsappCount: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  categoryId?: string;
  category?: Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  filtersJson?: any;
  totalFound: number;
  totalContacted: number;
  totalResponded: number;
  totalConverted: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  metrics: {
    totalLeads: number;
    leadsToday: number;
    leadsWithoutWebsite: number;
    leadsWithWhatsapp: number;
    leadsUncontacted: number;
    leadsConverted: number;
  };
  charts: {
    leadsByDay: { date: string; count: number }[];
    leadsByCategory: { name: string; count: number }[];
    leadsByCity: { city: string; state: string; count: number }[];
    websiteDistribution: { name: string; value: number; color: string }[];
    leadsByStatus: { status: LeadStatus; count: number }[];
    leadsByReviewCount: { range: string; count: number }[];
  };
  followUps: {
    overdue: FollowUp[];
    today: FollowUp[];
    upcoming: FollowUp[];
    totalPending: number;
  };
  topOpportunities: Lead[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
