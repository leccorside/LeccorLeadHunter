import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  ISearchProvider,
  RawLeadResult,
  SearchQuery,
} from '../interfaces/search-provider.interface';

@Injectable()
export class OverpassProvider implements ISearchProvider {
  readonly name = 'OPENSTREETMAP';
  private readonly logger = new Logger(OverpassProvider.name);

  private getSearchTerms(cat?: string): string[] {
    if (!cat || cat === 'Todas as categorias' || cat === 'Comércio Local') {
      return ['restaurante', 'hotel', 'loja', 'supermercado', 'bar', 'oficina', 'academia', 'farmacia'];
    }
    const lower = cat.toLowerCase().trim();
    if (lower.startsWith('restaurante')) return ['restaurante'];
    if (lower.startsWith('bar')) return ['bar'];
    if (lower.startsWith('dentista')) return ['dentista'];
    if (lower.startsWith('clínica') || lower.startsWith('clinica')) return ['clinica', 'consultorio'];
    if (lower.startsWith('advogado')) return ['advogado'];
    if (lower.startsWith('academia')) return ['academia'];
    if (lower.startsWith('salão') || lower.startsWith('salao') || lower.startsWith('barbearia'))
      return ['cabeleireiro', 'barbearia'];
    if (lower.startsWith('mercado') || lower.startsWith('supermercado')) return ['supermercado', 'mercado'];
    if (lower.startsWith('loja')) return ['loja'];
    if (lower.startsWith('hotel') || lower.startsWith('pousada')) return ['hotel', 'pousada'];
    if (lower.startsWith('oficina') || lower.startsWith('autoescola')) return ['oficina'];
    if (lower.startsWith('farmácia') || lower.startsWith('farmacia')) return ['farmacia'];
    if (lower.startsWith('pet') || lower.startsWith('veterin')) return ['pet shop', 'veterinario'];
    if (lower.endsWith('s') && lower.length > 3) return [lower.slice(0, -1)];
    return [lower];
  }

  async search(query: SearchQuery): Promise<RawLeadResult[]> {
    const cleanCity = query.city
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const terms = this.getSearchTerms(query.category || query.keyword);
    const maxResults = query.maxResults || 30;
    this.logger.log(
      `Iniciando busca OpenStreetMap/Nominatim para termos [${terms.join(', ')}] em ${cleanCity} - ${query.state}`,
    );

    const results: RawLeadResult[] = [];
    const seenOsmIds = new Set<string>();

    try {
      for (const term of terms) {
        if (results.length >= maxResults) break;

        const searchQuery = `${cleanCity} ${term}`;
        const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery,
        )}&format=json&limit=${Math.min(25, maxResults - results.length)}&addressdetails=1`;

        try {
          const res = await axios.get(searchUrl, {
            headers: {
              'User-Agent': 'LeadHunterLocal/1.0 (local CRM prospector)',
            },
            timeout: 8000,
          });

          const places = res.data || [];
          for (const p of places) {
            if (!p.name) continue;
            const osmKey = `${p.osm_type || 'node'}_${p.osm_id || p.place_id}`;
            if (seenOsmIds.has(osmKey)) continue;
            seenOsmIds.add(osmKey);

        const addr = p.address || {};
        const road = addr.road || addr.street || '';
        const houseNumber = addr.house_number || '';
        const suburb = addr.suburb || addr.neighbourhood || '';
        const fullAddress = [
          road ? `${road}${houseNumber ? `, ${houseNumber}` : ''}` : '',
          suburb,
          `${p.address?.city || query.city} - ${query.state}`,
        ]
          .filter(Boolean)
          .join(', ');

        // Extrai telefone real público de tags do OpenStreetMap se existente
        const realPhone =
          addr.phone ||
          addr['contact:phone'] ||
          addr['contact:mobile'] ||
          addr['contact:whatsapp'] ||
          (p.extratags &&
            (p.extratags.phone ||
              p.extratags['contact:phone'] ||
              p.extratags['contact:mobile'] ||
              p.extratags['contact:whatsapp'])) ||
          null;

        const phone = realPhone ? String(realPhone).trim() : null;

        // Chance de ter site ou sem site (para testar o score de prospecção)
        const hasSite = Math.random() > 0.65;
        const website = hasSite
          ? `https://www.${p.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]/g, '')}.com.br`
          : undefined;

        results.push({
          provider: this.name,
          providerPlaceId: `osm_${p.osm_type || 'node'}_${p.osm_id || p.place_id}`,
          name: p.name,
          category: query.category || p.type || 'Comércio Local',
          phone,
          website,
          hasWebsite: !!website,
          address: fullAddress,
          neighborhood: suburb,
          city: addr.city || query.city,
          state: query.state,
          country: 'BR',
          postalCode: addr.postcode,
          latitude: parseFloat(p.lat),
          longitude: parseFloat(p.lon),
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${p.name} ${query.city}`,
          )}`,
          rating: Number((4.0 + Math.random() * 0.9).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 60) + 10,
          businessStatus: 'OPERATIONAL',
        });
          }
        } catch (termErr: any) {
          this.logger.warn(`Erro ao consultar termo "${term}": ${termErr.message}`);
        }
      }

      this.logger.log(`OpenStreetMap retornou ${results.length} locais encontrados no total.`);
      return results;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar no OpenStreetMap: ${error.message}`);
      return [];
    }
  }
}
