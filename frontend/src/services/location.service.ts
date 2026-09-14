import api from './api';

export interface BrazilianState {
  uf: string;
  name: string;
}

export interface CityLocation {
  id: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

export const locationService = {
  async getStates(): Promise<BrazilianState[]> {
    try {
      const res: any = await api.get('/locations/states');
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
      return BRAZILIAN_STATES;
    } catch {
      return BRAZILIAN_STATES;
    }
  },

  async getCities(state?: string, query?: string): Promise<CityLocation[]> {
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (query) params.append('q', query);
      const res: any = await api.get(`/locations/cities?${params.toString()}`);
      return Array.isArray(res) ? res : (res?.data || []);
    } catch {
      return [];
    }
  },
};
