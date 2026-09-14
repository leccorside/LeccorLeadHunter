import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  Globe,
  MessageSquare,
  UserCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { dashboardService } from '../../services/dashboard.service';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { followUpService } from '../../services/followup.service';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: () => dashboardService.getDashboardData(),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalLeads: 0,
    leadsToday: 0,
    leadsWithoutWebsite: 0,
    leadsWithWhatsapp: 0,
    leadsUncontacted: 0,
    leadsConverted: 0,
  };

  const charts = data?.charts || {
    leadsByDay: [],
    leadsByCategory: [],
    leadsByCity: [],
    websiteDistribution: [],
    leadsByStatus: [],
    leadsByReviewCount: [],
  };

  const followUps = data?.followUps || {
    overdue: [],
    today: [],
    upcoming: [],
    totalPending: 0,
  };

  const topOpportunities = data?.topOpportunities || [];

  return (
    <div className="space-y-8">
      {/* 1. TOP CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total de Leads
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            {metrics.totalLeads}
          </div>
        </div>

        {/* Hoje */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Novos Hoje
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            {metrics.leadsToday}
          </div>
        </div>

        {/* Sem Site */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Sem Site
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 font-mono">
            {metrics.leadsWithoutWebsite}
          </div>
        </div>

        {/* Com WhatsApp */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Com WhatsApp
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {metrics.leadsWithWhatsapp}
          </div>
        </div>

        {/* Não Contatados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Não Contatados
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2 font-mono">
            {metrics.leadsUncontacted}
          </div>
        </div>

        {/* Convertidos em Clientes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Clientes Ganhos
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-2 font-mono">
            {metrics.leadsConverted}
          </div>
        </div>
      </div>

      {/* 2. FOLLOW-UP ALERTS (Hoje, Atrasados, Próximos) */}
      {followUps.totalPending > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Lembretes de Follow-up
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {followUps.totalPending} pendentes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Atrasados */}
            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Atrasados ({followUps.overdue.length})</span>
              </div>
              {followUps.overdue.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum follow-up atrasado.</p>
              ) : (
                <div className="space-y-2">
                  {followUps.overdue.slice(0, 3).map((f) => (
                    <div key={f.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {f.lead?.name}
                      </div>
                      <p className="text-slate-500 truncate">{f.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hoje */}
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                <Clock className="w-4 h-4" />
                <span>Para Hoje ({followUps.today.length})</span>
              </div>
              {followUps.today.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum follow-up para hoje.</p>
              ) : (
                <div className="space-y-2">
                  {followUps.today.slice(0, 3).map((f) => (
                    <div key={f.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {f.lead?.name}
                      </div>
                      <p className="text-slate-500 truncate">{f.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Próximos */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Próximos ({followUps.upcoming.length})</span>
              </div>
              {followUps.upcoming.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum agendamento futuro.</p>
              ) : (
                <div className="space-y-2">
                  {followUps.upcoming.slice(0, 3).map((f) => (
                    <div key={f.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {f.lead?.name}
                      </div>
                      <p className="text-slate-500 truncate">{f.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Encontrados por Dia */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Leads Encontrados por Dia (Últimos 14 dias)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.leadsByDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="count" name="Leads" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Com Site vs Sem Site */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
            Presença de Website
          </h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.websiteDistribution}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.websiteDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Sem Site ({metrics.leadsWithoutWebsite})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Com Site ({metrics.totalLeads - metrics.leadsWithoutWebsite})</span>
            </div>
          </div>
        </div>

        {/* Leads por Categoria */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Top Categorias de Empresas
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.leadsByCategory}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" name="Leads" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads por Avaliações */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Faixa de Avaliações
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.leadsByReviewCount}>
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" name="Empresas" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. TOP OPORTUNIDADES (Maior Score) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Maiores Oportunidades Comerciais
            </h2>
            <p className="text-xs text-slate-500">
              Leads não contatados com o maior score de oportunidade para fechamento
            </p>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos os leads</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {topOpportunities.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Nenhuma oportunidade registrada ainda. Clique em "Nova Busca de Leads" para iniciar!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topOpportunities.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {lead.name}
                    </h4>
                    <ScoreBadge score={lead.score} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>{lead.category?.name || 'Comércio Local'}</span>
                    <span>•</span>
                    <span>{lead.city}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={lead.status} size="sm" />
                    {!lead.hasWebsite && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Sem site
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <WhatsAppButton lead={lead} variant="table" onContactRecorded={refetch} />
                  <button
                    onClick={() => navigate(`/leads?id=${lead.id}`)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
