import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Star,
  Globe,
  Phone,
  MessageSquare,
  MapPin,
  ExternalLink,
  Clock,
  FileText,
  Calendar,
  Sparkles,
  Heart,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Lead, LeadStatus, MessageTemplate } from '../../types';
import { leadService } from '../../services/lead.service';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';

interface LeadDetailsDrawerProps {
  leadId: string | null;
  onClose: () => void;
  templates?: MessageTemplate[];
  onLeadUpdated?: () => void;
}

export const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({
  leadId,
  onClose,
  templates = [],
  onLeadUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'notes' | 'followup' | 'seo'>('info');
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Form Follow-up
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // Análise de Website
  const [analyzingWebsite, setAnalyzingWebsite] = useState(false);

  const { data: lead, isLoading, refetch } = useQuery<Lead>({
    queryKey: ['lead-details', leadId],
    queryFn: () => leadService.getLead(leadId!),
    enabled: !!leadId,
  });

  if (!leadId) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    try {
      await leadService.updateLead(lead.id, { status: newStatus });
      refetch();
      if (onLeadUpdated) onLeadUpdated();
    } catch (e) {
      console.error('Erro ao alterar status:', e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!lead) return;
    try {
      await leadService.updateLead(lead.id, { favorite: !lead.favorite });
      refetch();
      if (onLeadUpdated) onLeadUpdated();
    } catch (e) {
      console.error('Erro ao favoritar:', e);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim()) return;
    try {
      setSubmittingNote(true);
      await leadService.addNote(lead.id, newNote.trim());
      setNewNote('');
      refetch();
    } catch (e) {
      console.error('Erro ao adicionar nota:', e);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !followUpDate || !followUpReason.trim()) return;
    try {
      setSubmittingFollowUp(true);
      await leadService.addFollowUp(lead.id, followUpDate, followUpReason.trim());
      setFollowUpDate('');
      setFollowUpReason('');
      refetch();
      if (onLeadUpdated) onLeadUpdated();
    } catch (e) {
      console.error('Erro ao agendar follow-up:', e);
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const handleAnalyzeWebsite = async () => {
    if (!lead) return;
    try {
      setAnalyzingWebsite(true);
      await leadService.analyzeWebsite(lead.id);
      refetch();
      if (onLeadUpdated) onLeadUpdated();
    } catch (e) {
      console.error('Erro ao analisar website:', e);
    } finally {
      setAnalyzingWebsite(false);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full z-10 animate-fade-in">
        {/* Header do Drawer */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white truncate max-w-sm">
                {lead?.name}
              </h2>
              <button
                onClick={handleToggleFavorite}
                className={`p-1 rounded-md transition-colors ${
                  lead?.favorite
                    ? 'text-rose-500 fill-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${lead?.favorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{lead?.category?.name || 'Comércio Local'}</span>
              <span>•</span>
              <span>{lead?.city} - {lead?.state}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pipeline & Score Bar */}
        {lead && (
          <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-900 dark:text-white"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Oportunidade:</span>
              <ScoreBadge score={lead.score} size="md" />
            </div>
          </div>
        )}

        {/* Tabs de navegação do Drawer */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Linha do Tempo ({lead?.history?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Notas ({lead?.notes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'followup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Follow-up
          </button>
          {lead?.hasWebsite && (
            <button
              onClick={() => setActiveTab('seo')}
              className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'seo'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Análise SEO
            </button>
          )}
        </div>

        {/* Conteúdo das Tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-sm w-3/4" />
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ) : !lead ? (
            <div>Lead não encontrado.</div>
          ) : (
            <>
              {/* TAB 1: INFORMAÇÕES */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Ações Rápidas */}
                  <div className="flex flex-wrap gap-2">
                    <WhatsAppButton
                      lead={lead}
                      variant="button"
                      templates={templates}
                      onContactRecorded={refetch}
                    />
                    {lead.googleMapsUrl && (
                      <a
                        href={lead.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Abrir no Maps</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                    {lead.website && (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span>Abrir Website</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                  </div>

                  {/* Dados de Contato e Localização */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Dados de Contato
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Telefone:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">
                          {lead.phone || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">WhatsApp:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {lead.whatsappStatus === 'VERIFIED'
                            ? 'Verificado ✓'
                            : lead.whatsappStatus === 'UNKNOWN'
                            ? 'Celular (?)'
                            : 'Não possui'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Website:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200 truncate block">
                          {lead.website || 'Sem site cadastrado (Oportunidade!)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Email:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {lead.email || 'Não encontrado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Endereço & Reputação */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Endereço e Reputação
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Endereço Completo:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-200">
                          {lead.address || `${lead.city} - ${lead.state}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 pt-1">
                        <div>
                          <span className="text-slate-500 block">Nota Média:</span>
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{Number(lead.rating) || 0}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Avaliações:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {lead.reviewCount || 0} avaliações
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>Descoberto em: {new Date(lead.createdAt).toLocaleString('pt-BR')}</div>
                    <div>Última atualização: {new Date(lead.updatedAt).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              )}

              {/* TAB 2: HISTÓRICO / LINHA DO TEMPO */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {(!lead.history || lead.history.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">Nenhum evento registrado ainda.</p>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {lead.history.map((h) => (
                        <div key={h.id} className="relative">
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                          <div className="text-[11px] text-slate-400">
                            {new Date(h.createdAt).toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                            {h.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NOTAS */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      required
                      rows={3}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ex: Falou com o gerente Paulo, pediu retorno terça-feira..."
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingNote}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Adicionar Nota</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3 pt-2">
                    {(!lead.notes || lead.notes.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">Nenhuma anotação adicionada ainda.</p>
                    ) : (
                      lead.notes.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        >
                          <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                            {n.note}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-2 text-right">
                            {new Date(n.createdAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: FOLLOW-UP */}
              {activeTab === 'followup' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddFollowUp} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Agendar Próximo Contato
                    </h3>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Data e Hora:
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Motivo / Assunto:
                      </label>
                      <input
                        type="text"
                        required
                        value={followUpReason}
                        onChange={(e) => setFollowUpReason(e.target.value)}
                        placeholder="Ex: Apresentar proposta do site institucional"
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingFollowUp}
                      className="w-full py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Salvar Agendamento
                    </button>
                  </form>

                  {/* Agendamentos Existentes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Lembretes Cadastrados:
                    </h4>
                    {(!lead.followUps || lead.followUps.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">Nenhum follow-up agendado.</p>
                    ) : (
                      lead.followUps.map((f) => (
                        <div
                          key={f.id}
                          className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {f.reason}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-blue-500" />
                              <span>{new Date(f.scheduledFor).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {f.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: AUDITORIA SEO DO WEBSITE */}
              {activeTab === 'seo' && lead.hasWebsite && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        WebsiteAnalyzer (SEO & Velocidade)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Diagnóstico técnico automático do site da empresa
                      </p>
                    </div>
                    <button
                      onClick={handleAnalyzeWebsite}
                      disabled={analyzingWebsite}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      {analyzingWebsite ? 'Analisando...' : 'Reanalisar Site'}
                    </button>
                  </div>

                  {lead.websiteAnalysis ? (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Score Técnico:</span>
                        <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                          {lead.websiteAnalysis.score} / 100
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-slate-500 block">Online / Acessível:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {lead.websiteAnalysis.isReachable ? 'Sim ✓' : 'Não ✕'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">HTTPS Seguro:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {lead.websiteAnalysis.isHttps ? 'Sim ✓' : 'Não (Inseguro!) ✕'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tempo de Resposta:</span>
                          <span className="font-semibold text-slate-900 dark:text-white font-mono">
                            {lead.websiteAnalysis.responseTimeMs} ms
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Meta Viewport (Mobile):</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {lead.websiteAnalysis.hasViewport ? 'Presente ✓' : 'Ausente ✕'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <div>
                          <span className="text-slate-500 block font-semibold">Meta Title:</span>
                          <span className="text-slate-800 dark:text-slate-200 italic">
                            {lead.websiteAnalysis.title || 'Sem título identificado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-semibold">Meta Description:</span>
                          <span className="text-slate-800 dark:text-slate-200 italic">
                            {lead.websiteAnalysis.metaDescription || 'Sem meta description (Oportunidade para SEO!)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl space-y-2">
                      <p className="text-xs text-slate-500">
                        O website ainda não foi auditado pelo WebsiteAnalyzer.
                      </p>
                      <button
                        onClick={handleAnalyzeWebsite}
                        disabled={analyzingWebsite}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                      >
                        {analyzingWebsite ? 'Analisando...' : 'Executar Análise Técnica Agora'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
