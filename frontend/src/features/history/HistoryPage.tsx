import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Search, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { searchService } from '../../services/search.service';
import api from '../../services/api';
import { Search as SearchType } from '../../types';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'searches' | 'contacts'>('searches');

  // Histórico de Buscas
  const { data: searches = [], isLoading: loadingSearches } = useQuery<SearchType[]>({
    queryKey: ['searches-history'],
    queryFn: () => searchService.getHistory(),
  });

  // Histórico de Contatos
  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts-history'],
    queryFn: async () => {
      const res: any = await api.get('/contacts');
      return res.data || res;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Histórico & Auditoria de Atividades
          </h2>
          <p className="text-xs text-slate-500">
            Registro de buscas de empresas efetuadas e histórico de abordagens comerciais
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('searches')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'searches'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscas Realizadas ({searches.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'contacts'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Contatos Disparados ({contacts.length})</span>
        </button>
      </div>

      {/* TAB 1: BUSCAS */}
      {activeTab === 'searches' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Data / Hora</th>
                <th className="p-4">Localização</th>
                <th className="p-4">Nicho / Categoria</th>
                <th className="p-4">Provedor</th>
                <th className="p-4">Encontradas</th>
                <th className="p-4">Novos Leads</th>
                <th className="p-4">Duplicados</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingSearches ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Carregando histórico...
                  </td>
                </tr>
              ) : searches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Nenhuma busca registrada no histórico.
                  </td>
                </tr>
              ) : (
                searches.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 text-slate-500">
                      {new Date(s.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {s.city} - {s.state}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {s.category?.name || 'Geral'}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {s.provider}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {s.totalFound}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {s.newLeadsCount}
                    </td>
                    <td className="p-4 font-mono text-amber-600">
                      {s.duplicateCount}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : s.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CONTATOS */}
      {activeTab === 'contacts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Data / Hora</th>
                <th className="p-4">Empresa / Lead</th>
                <th className="p-4">Canal</th>
                <th className="p-4">Template Utilizado</th>
                <th className="p-4">Mensagem Enviada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingContacts ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Carregando contatos...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhum contato registrado ainda.
                  </td>
                </tr>
              ) : (
                contacts.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 text-slate-500">
                      {new Date(c.sentAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {c.lead?.name}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {c.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {c.messageTemplate?.name || 'Mensagem Manual'}
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-500" title={c.messageText}>
                      {c.messageText}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
