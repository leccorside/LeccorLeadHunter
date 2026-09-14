import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Settings,
  Key,
  Sliders,
  MessageSquare,
  Database,
  Activity,
  Save,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { settingService } from '../../services/setting.service';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'score' | 'whatsapp' | 'backup' | 'health'>('api');
  const [googleKey, setGoogleKey] = useState('');
  const [defaultMessage, setDefaultMessage] = useState('');
  const [noSiteWeight, setNoSiteWeight] = useState('40');
  const [hasPhoneWeight, setHasPhoneWeight] = useState('10');
  const [hasWhatsappWeight, setHasWhatsappWeight] = useState('20');
  const [reviews20Weight, setReviews20Weight] = useState('10');
  const [reviews100Weight, setReviews100Weight] = useState('10');
  const [goodRatingWeight, setGoodRatingWeight] = useState('5');
  const [badSiteWeight, setBadSiteWeight] = useState('15');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: settingsData, refetch } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => settingService.getSettings(),
  });

  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => settingService.getHealth(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (settingsData?.dict) {
      const d = settingsData.dict;
      if (d.google_maps_api_key !== undefined) setGoogleKey(d.google_maps_api_key);
      if (d.whatsapp_default_message !== undefined) setDefaultMessage(d.whatsapp_default_message);
      if (d.score_no_website_weight !== undefined) setNoSiteWeight(d.score_no_website_weight);
      if (d.score_has_phone_weight !== undefined) setHasPhoneWeight(d.score_has_phone_weight);
      if (d.score_has_whatsapp_weight !== undefined) setHasWhatsappWeight(d.score_has_whatsapp_weight);
      if (d.score_min_reviews_20_weight !== undefined) setReviews20Weight(d.score_min_reviews_20_weight);
      if (d.score_min_reviews_100_weight !== undefined) setReviews100Weight(d.score_min_reviews_100_weight);
      if (d.score_good_rating_weight !== undefined) setGoodRatingWeight(d.score_good_rating_weight);
      if (d.score_bad_website_weight !== undefined) setBadSiteWeight(d.score_bad_website_weight);
    }
  }, [settingsData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingService.updateSettings({
        google_maps_api_key: googleKey,
        whatsapp_default_message: defaultMessage,
        score_no_website_weight: noSiteWeight,
        score_has_phone_weight: hasPhoneWeight,
        score_has_whatsapp_weight: hasWhatsappWeight,
        score_min_reviews_20_weight: reviews20Weight,
        score_min_reviews_100_weight: reviews100Weight,
        score_good_rating_weight: goodRatingWeight,
        score_bad_website_weight: badSiteWeight,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      refetch();
    } catch (e: any) {
      alert(`Erro ao salvar configurações: ${e.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Configurações da Plataforma
          </h2>
          <p className="text-xs text-slate-500">
            Gerenciamento de credenciais, motor de score, mensagens padrão e banco de dados
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('api')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'api'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Google Places API</span>
        </button>

        <button
          onClick={() => setActiveTab('score')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'score'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Regras de Score</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'whatsapp'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp Padrão</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Banco</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'health'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Status do Sistema</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: GOOGLE PLACES API */}
        {activeTab === 'api' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Google Maps Platform / Places API Key
            </h3>
            <p className="text-xs text-slate-500">
              Sua chave permanece 100% segura no backend e nunca é exposta no navegador. Se deixar em branco, o LeadHunter Local utilizará automaticamente o provedor OpenStreetMap gratuito.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Google Maps API Key:
              </label>
              <input
                type="password"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <strong>Dica de Segurança:</strong> No Google Cloud Console, ative as APIs: <em>Places API (New)</em> e <em>Geocoding API</em>. O LeadHunter gerencia rate-limiting e retries automáticos para proteger sua cota.
            </div>
          </div>
        )}

        {/* TAB 2: REGRAS DE SCORE */}
        {activeTab === 'score' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pesos do Motor de Oportunidade Comercial (0 a 100)
              </h3>
              <p className="text-xs text-slate-500">
                Ajuste os pontos atribuídos a cada critério identificado nas empresas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sem Website (+ pontos):
                </label>
                <input
                  type="number"
                  value={noSiteWeight}
                  onChange={(e) => setNoSiteWeight(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Possui Telefone (+ pontos):
                </label>
                <input
                  type="number"
                  value={hasPhoneWeight}
                  onChange={(e) => setHasPhoneWeight(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Possui WhatsApp Confirmado (+ pontos):
                </label>
                <input
                  type="number"
                  value={hasWhatsappWeight}
                  onChange={(e) => setHasWhatsappWeight(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mais de 20 Avaliações (+ pontos):
                </label>
                <input
                  type="number"
                  value={reviews20Weight}
                  onChange={(e) => setReviews20Weight(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mais de 100 Avaliações (+ pontos):
                </label>
                <input
                  type="number"
                  value={reviews100Weight}
                  onChange={(e) => setReviews100Weight(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nota Avaliação &gt;= 4.0 (+ pontos):
                </label>
                <input
                  type="number"
                  value={goodRatingWeight}
                  onChange={(e) => setGoodRatingWeight(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Lento, Inseguro ou sem HTTPS (+ pontos de oportunidade de redesign):
                </label>
                <input
                  type="number"
                  value={badSiteWeight}
                  onChange={(e) => setBadSiteWeight(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP PADRÃO */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mensagem WhatsApp Padrão
            </h3>
            <p className="text-xs text-slate-500">
              Mensagem padrão utilizada quando nenhum outro template específico for selecionado
            </p>

            <div>
              <textarea
                rows={4}
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 4: BACKUP & BANCO */}
        {activeTab === 'backup' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Backup e Restauração do Banco PostgreSQL
            </h3>
            <p className="text-xs text-slate-500">
              Todos os dados ficam armazenados no volume persistente <code>postgres_data</code> do Docker Compose.
            </p>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-2">
              <div className="text-slate-400"># 1. Comando para Gerar Backup (.sql):</div>
              <div className="text-emerald-400 select-all">
                docker exec -t lead-hunter-postgres pg_dump -U postgres -d leadhunter &gt; backup_leadhunter.sql
              </div>

              <div className="text-slate-400 pt-2"># 2. Comando para Restaurar Backup:</div>
              <div className="text-emerald-400 select-all">
                docker exec -i lead-hunter-postgres psql -U postgres -d leadhunter &lt; backup_leadhunter.sql
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HEALTH CHECK */}
        {activeTab === 'health' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Diagnóstico dos Containers e Serviços
              </h3>
              <button
                type="button"
                onClick={() => refetchHealth()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Atualizar Status
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-slate-500 block">PostgreSQL 16:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {healthData?.services?.database || 'Conectando...'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-slate-500 block">Redis 7 (BullMQ):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {healthData?.services?.redis || 'Conectando...'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-slate-500 block">BullMQ Worker:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {healthData?.services?.worker || 'Pronto'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-slate-500 block">Google Places API:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {healthData?.services?.providers?.googlePlaces || 'Ativo'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botão Salvar Geral */}
        {activeTab !== 'health' && activeTab !== 'backup' && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
