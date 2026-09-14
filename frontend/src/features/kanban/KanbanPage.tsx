import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadService } from '../../services/lead.service';
import { messageService } from '../../services/message.service';
import { Lead, LeadStatus } from '../../types';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { LeadDetailsDrawer } from '../leads/LeadDetailsDrawer';
import { Phone, Globe, ArrowRight, Eye, MoreHorizontal } from 'lucide-react';

const kanbanColumns: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'NOVO', label: 'Novo', color: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  { id: 'CONTATADO', label: 'Contatado', color: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'RESPONDEU', label: 'Respondeu', color: 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  { id: 'INTERESSADO', label: 'Interessado', color: 'border-cyan-500 text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
  { id: 'NEGOCIACAO', label: 'Negociação', color: 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  { id: 'CLIENTE', label: 'Cliente Ganho', color: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'SEM_INTERESSE', label: 'Sem Interesse', color: 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
];

export const KanbanPage: React.FC = () => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { data: kanbanData, isLoading, refetch } = useQuery<Record<LeadStatus, Lead[]>>({
    queryKey: ['leads-kanban'],
    queryFn: () => leadService.getKanban(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['message-templates-kanban'],
    queryFn: () => messageService.getTemplates(),
  });

  const handleMoveStatus = async (leadId: string, nextStatus: LeadStatus) => {
    try {
      await leadService.updateLead(leadId, { status: nextStatus });
      refetch();
    } catch (e) {
      console.error('Erro ao mover lead:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Funil Comercial Kanban
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe a evolução de cada oportunidade de prospecção em tempo real
          </p>
        </div>
      </div>

      {/* Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start min-h-[calc(100vh-220px)]">
        {kanbanColumns.map((col) => {
          const leadsInCol = kanbanData ? kanbanData[col.id] || [] : [];

          return (
            <div
              key={col.id}
              className="w-80 shrink-0 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col max-h-[80vh]"
            >
              {/* Header da Coluna */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[0].replace('border', 'bg')}`} />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {col.label}
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  {leadsInCol.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="h-24 bg-white/60 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                ) : leadsInCol.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    Nenhum lead nesta etapa
                  </div>
                ) : (
                  leadsInCol.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h4
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                          title={lead.name}
                        >
                          {lead.name}
                        </h4>
                        <ScoreBadge score={lead.score} size="sm" showLabel={false} />
                      </div>

                      <div className="text-[11px] text-slate-500 truncate">
                        {lead.category?.name || 'Comércio'} • {lead.city}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {!lead.hasWebsite ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Sem site
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 truncate">
                            Com site
                          </span>
                        )}
                      </div>

                      {/* Botões de Ação do Card */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <WhatsAppButton
                          lead={lead}
                          variant="table"
                          templates={templates}
                          onContactRecorded={refetch}
                        />

                        {/* Mover para próximo status */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-sm"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <select
                            value={lead.status}
                            onChange={(e) => handleMoveStatus(lead.id, e.target.value as any)}
                            className="text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-0.5 px-1 text-slate-700 dark:text-slate-300"
                          >
                            {kanbanColumns.map((c) => (
                              <option key={c.id} value={c.id}>
                                → {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer de Detalhes */}
      <LeadDetailsDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        templates={templates}
        onLeadUpdated={refetch}
      />
    </div>
  );
};
