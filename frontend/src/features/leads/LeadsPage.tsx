import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Star,
  Globe,
  Heart,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { leadService, LeadFilters } from '../../services/lead.service';
import { categoryService } from '../../services/category.service';
import { messageService } from '../../services/message.service';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { LeadDetailsDrawer } from './LeadDetailsDrawer';
import { LeadStatus } from '../../types';

export const LeadsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados dos filtros
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hasWebsite, setHasWebsite] = useState('');
  const [hasWhatsapp, setHasWhatsapp] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | ''>('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isContacted, setIsContacted] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drawer de detalhes
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    searchParams.get('id') || null,
  );

  // Consulta categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-filter'],
    queryFn: () => categoryService.getCategories(),
  });

  // Consulta templates de mensagem para o botão WhatsApp
  const { data: templates = [] } = useQuery({
    queryKey: ['message-templates-list'],
    queryFn: () => messageService.getTemplates(),
  });

  // Objeto de filtros
  const filters: LeadFilters = {
    page,
    limit,
    search: searchQuery || undefined,
    city: selectedCity || undefined,
    categoryId: selectedCategory || undefined,
    hasWebsite: hasWebsite !== '' ? hasWebsite : undefined,
    hasWhatsapp: hasWhatsapp !== '' ? hasWhatsapp : undefined,
    status: selectedStatus ? selectedStatus : undefined,
    favorite: onlyFavorites ? 'true' : undefined,
    isContacted: isContacted !== '' ? isContacted : undefined,
    sortBy,
    sortOrder,
  };

  // Consulta paginada dos leads
  const { data: paginatedData, isLoading, refetch } = useQuery({
    queryKey: ['leads-list', filters],
    queryFn: () => leadService.getLeads(filters),
  });

  const leads = paginatedData?.data || [];
  const meta = paginatedData?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const handleToggleFavorite = async (leadId: string, current: boolean) => {
    try {
      await leadService.updateLead(leadId, { favorite: !current });
      refetch();
    } catch (e) {
      console.error('Erro ao favoritar lead:', e);
    }
  };

  const handleDeleteLead = async (leadId: string, name: string) => {
    if (confirm(`Deseja realmente remover a empresa "${name}"?`)) {
      try {
        await leadService.deleteLead(leadId);
        refetch();
      } catch (e) {
        console.error('Erro ao excluir lead:', e);
      }
    }
  };

  const handleClearAllLeads = async () => {
    if (
      confirm(
        'Deseja realmente apagar TODOS os leads cadastrados do banco de dados para iniciar uma nova captação limpa?',
      )
    ) {
      try {
        await leadService.clearAllLeads();
        refetch();
      } catch (err: any) {
        alert(`Erro ao limpar leads: ${err.message}`);
      }
    }
  };

  const statuses: LeadStatus[] = [
    'NOVO',
    'NAO_CONTATADO',
    'CONTATADO',
    'RESPONDEU',
    'INTERESSADO',
    'NEGOCIACAO',
    'CLIENTE',
    'SEM_INTERESSE',
    'FOLLOW_UP',
    'ARQUIVADO',
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Exportação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, telefone, cidade ou endereço..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Botões de Exportação */}
          <div className="flex items-center gap-2">
            <a
              href={leadService.getExportUrl('excel', filters)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </a>

            <a
              href={leadService.getExportUrl('csv', filters)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Exportar CSV</span>
            </a>

            <button
              onClick={handleClearAllLeads}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-colors shadow-2xs cursor-pointer"
              title="Limpar todos os leads cadastrados no banco de dados"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Limpar Leads</span>
            </button>
          </div>
        </div>

        {/* Filtros em Linha */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
          >
            <option value="">Todos os Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Presença de Site */}
          <select
            value={hasWebsite}
            onChange={(e) => {
              setHasWebsite(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
          >
            <option value="">Site: Todos</option>
            <option value="false">Sem Website (Oportunidade)</option>
            <option value="true">Com Website</option>
          </select>

          {/* Presença de WhatsApp */}
          <select
            value={hasWhatsapp}
            onChange={(e) => {
              setHasWhatsapp(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
          >
            <option value="">WhatsApp: Todos</option>
            <option value="true">Com WhatsApp</option>
            <option value="false">Sem WhatsApp</option>
          </select>

          {/* Contato Realizado */}
          <select
            value={isContacted}
            onChange={(e) => {
              setIsContacted(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
          >
            <option value="">Abordagem: Todas</option>
            <option value="false">Não contatados</option>
            <option value="true">Já contatados</option>
          </select>

          {/* Ordenar Por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
          >
            <option value="score">Ordenar por Score</option>
            <option value="createdAt">Data de Descoberta</option>
            <option value="rating">Nota Média</option>
            <option value="reviewCount">Nº Avaliações</option>
            <option value="name">Nome da Empresa</option>
          </select>
        </div>
      </div>

      {/* Tabela de Leads */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4 w-10">★</th>
                <th className="p-4">Empresa</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Cidade</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Link Google</th>
                <th className="p-4">Site</th>
                <th className="p-4">Avaliações</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={12} className="p-4">
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    Nenhuma empresa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Favorito */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleFavorite(lead.id, lead.favorite)}
                        className={`p-1 rounded-sm transition-colors ${
                          lead.favorite ? 'text-rose-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${lead.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Nome */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {lead.name}
                      </div>
                      {lead.address && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {lead.address}
                        </div>
                      )}
                    </td>

                    {/* Categoria */}
                    <td className="p-4 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                      {lead.category?.name || 'Geral'}
                    </td>

                    {/* Cidade */}
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {lead.city}
                    </td>

                    {/* Telefone */}
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                      {lead.phone || <span className="text-slate-400 italic">Sem fone</span>}
                    </td>

                    {/* WhatsApp */}
                    <td className="p-4">
                      <WhatsAppButton
                        lead={lead}
                        variant="table"
                        templates={templates}
                        onContactRecorded={refetch}
                      />
                    </td>

                    {/* Google da Empresa */}
                    <td className="p-4 whitespace-nowrap">
                      {(() => {
                        const googleUrl =
                          lead.googleMapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${lead.name} ${lead.city || ''} ${lead.state || ''}`.trim(),
                          )}`;

                        return (
                          <a
                            href={googleUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-900/50 transition-colors shadow-2xs group"
                            title={`Ver perfil e compartilhar ${lead.name} no Google`}
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                            </svg>
                            <span>Google Empresa</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        );
                      })()}
                    </td>

                    {/* Site */}
                    <td className="p-4 whitespace-nowrap">
                      {lead.hasWebsite ? (
                        <a
                          href={lead.website!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline max-w-[120px] truncate whitespace-nowrap"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate whitespace-nowrap">Visitar</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 whitespace-nowrap shrink-0">
                          Sem site
                        </span>
                      )}
                    </td>

                    {/* Avaliações & Nota */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-500 font-bold whitespace-nowrap">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{Number(lead.rating) || 0}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">
                        {lead.reviewCount || 0} avaliações
                      </div>
                    </td>

                    {/* Score */}
                    <td className="p-4 whitespace-nowrap">
                      <ScoreBadge score={lead.score} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={lead.status} size="sm" />
                    </td>

                    {/* Ações */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalhes completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação do Servidor */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Mostrando <strong>{leads.length}</strong> de <strong>{meta.total}</strong> empresas encontradas
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Página <strong>{page}</strong> de <strong>{meta.totalPages || 1}</strong>
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer de Detalhes do Lead */}
      <LeadDetailsDrawer
        leadId={selectedLeadId}
        onClose={() => {
          setSelectedLeadId(null);
          setSearchParams({});
        }}
        templates={templates}
        onLeadUpdated={refetch}
      />
    </div>
  );
};
