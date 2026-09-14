export interface EnrichmentResult {
  email?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  description?: string;
  additionalData?: Record<string, any>;
}

export interface ILeadEnrichmentProvider {
  readonly name: string;
  enrich(lead: {
    name: string;
    website?: string;
    city?: string;
    state?: string;
  }): Promise<EnrichmentResult>;
}
