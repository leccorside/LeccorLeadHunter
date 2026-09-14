import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { leadService } from '../../services/lead.service';
import { messageService } from '../../services/message.service';
import { Lead } from '../../types';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { Globe, MapPin, Phone } from 'lucide-react';

// Criador de marcadores SVG customizados com cores por status
const createStatusIcon = (status: string) => {
  let color = '#3b82f6'; // azul: novo (padrão)
  if (status === 'CLIENTE') color = '#10b981'; // verde: cliente
  if (status === 'CONTATADO' || status === 'RESPONDEU' || status === 'INTERESSADO' || status === 'NEGOCIACAO')
    color = '#f59e0b'; // amarelo: contatado
  if (status === 'SEM_INTERESSE') color = '#ef4444'; // vermelho: sem interesse

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export const MapPage: React.FC = () => {
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['leads-map'],
    queryFn: () => leadService.getLeads({ limit: 300 }),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['message-templates-map'],
    queryFn: () => messageService.getTemplates(),
  });

  const allLeads = paginatedData?.data || [];
  // Filtra leads que possuem latitude e longitude válidas
  const leadsWithCoords = allLeads.filter(
    (l) => l.latitude && l.longitude && !isNaN(Number(l.latitude)) && !isNaN(Number(l.longitude)),
  );

  // Centro padrão do mapa (Brasil ou média dos leads)
  const defaultCenter: [number, number] =
    leadsWithCoords.length > 0
      ? [Number(leadsWithCoords[0].latitude), Number(leadsWithCoords[0].longitude)]
      : [-17.7444, -48.6253]; // Caldas Novas default

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Mapa de Oportunidades Comerciais
          </h2>
          <p className="text-xs text-slate-500">
            {leadsWithCoords.length} empresas geolocalizadas no mapa
          </p>
        </div>

        {/* Legenda de Cores (Requisito #22) */}
        <div className="flex items-center gap-4 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Novo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Contatado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Cliente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Sem Interesse</span>
          </div>
        </div>
      </div>

      {/* Container do Mapa Leaflet */}
      <div className="w-full h-[calc(100vh-230px)] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="text-sm text-slate-500 animate-pulse">Carregando mapa...</div>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {leadsWithCoords.map((lead) => (
              <Marker
                key={lead.id}
                position={[Number(lead.latitude), Number(lead.longitude)]}
                icon={createStatusIcon(lead.status)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-2 min-w-[220px]">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{lead.name}</h4>
                      <ScoreBadge score={lead.score} size="sm" showLabel={false} />
                    </div>

                    <div className="text-xs text-slate-500">
                      {lead.category?.name || 'Comércio Local'} • {lead.city}
                    </div>

                    <div className="text-xs space-y-1 pt-1 border-t border-slate-100">
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.website ? (
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <Globe className="w-3 h-3 text-blue-500" />
                          <a href={lead.website} target="_blank" rel="noreferrer" className="truncate hover:underline">
                            Site
                          </a>
                        </div>
                      ) : (
                        <div className="text-amber-600 font-semibold text-[11px]">
                          Sem website cadastrado
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <WhatsAppButton lead={lead} variant="table" templates={templates} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};
