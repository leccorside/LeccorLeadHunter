import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Building2,
  Phone,
  Globe,
  Star,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { locationService, BRAZILIAN_STATES } from '../../services/location.service';
import { categoryService } from '../../services/category.service';
import { searchService, StartSearchPayload } from '../../services/search.service';
import { Modal } from '../../components/ui/Modal';
import { Search as SearchType } from '../../types';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados do formulário de busca
  const [country, setCountry] = useState('Brasil');
  const [selectedState, setSelectedState] = useState('Goiás');
  const [city, setCity] = useState('Caldas Novas');
  const [categoryName, setCategoryName] = useState('Restaurantes');
  const [customCategory, setCustomCategory] = useState('');
  const [provider, setProvider] = useState<'GOOGLE_PLACES' | 'OPENSTREETMAP'>('GOOGLE_PLACES');
  const [radiusKm, setRadiusKm] = useState(15);
  const [maxResults, setMaxResults] = useState(50);

  // Filtros avançados
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState(true);
  const [onlyWithPhone, setOnlyWithPhone] = useState(true);
  const [onlyWithWhatsapp, setOnlyWithWhatsapp] = useState(false);
  const [onlyWithoutWhatsapp, setOnlyWithoutWhatsapp] = useState(false);
  const [minReviews, setMinReviews] = useState<number | undefined>(undefined);
  const [maxReviews, setMaxReviews] = useState<number | undefined>(50);
  const [minRating, setMinRating] = useState<number | undefined>(3);
  const [maxRating, setMaxRating] = useState<number | undefined>(undefined);
  const [excludeExisting, setExcludeExisting] = useState(true);

  // Controle do modal de progresso
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca lista de estados (com fallback imediato para os 27 estados do Brasil)
  const { data: states = BRAZILIAN_STATES } = useQuery({
    queryKey: ['brazilian-states'],
    queryFn: () => locationService.getStates(),
    initialData: BRAZILIAN_STATES,
  });

  // Busca lista de categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => categoryService.getCategories(),
  });

  // Polling do progresso da busca ativa no BullMQ
  const { data: searchProgress, refetch: refetchProgress } = useQuery<SearchType>({
    queryKey: ['search-progress', activeSearchId],
    queryFn: () => searchService.getProgress(activeSearchId!),
    enabled: !!activeSearchId && isModalOpen,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
        return false;
      }
      return 1500; // atualiza a cada 1.5s
    },
  });

  const handleStartSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCat = categoryName === '__custom__' ? customCategory : categoryName;

    const payload: StartSearchPayload = {
      country: 'BR',
      state: selectedState,
      city: city.trim(),
      categoryName: selectedCat,
      provider,
      radiusKm,
      maxResults,
      onlyWithoutWebsite,
      onlyWithPhone,
      onlyWithWhatsapp,
      onlyWithoutWhatsapp,
      minReviews: minReviews ? Number(minReviews) : undefined,
      maxReviews: maxReviews ? Number(maxReviews) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      maxRating: maxRating ? Number(maxRating) : undefined,
      excludeExisting,
    };

    try {
      const searchRecord = await searchService.startSearch(payload);
      setActiveSearchId(searchRecord.id);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(`Erro ao iniciar busca: ${err.message}`);
    }
  };

  const handleCancelSearch = async () => {
    if (!activeSearchId) return;
    try {
      await searchService.cancelSearch(activeSearchId);
      refetchProgress();
    } catch (err: any) {
      console.error('Erro ao cancelar:', err);
    }
  };

  // Cálculo de percentual de progresso
  const totalFound = searchProgress?.totalFound || 0;
  const processed = searchProgress?.processedCount || 0;
  const isFinished =
    searchProgress?.status === 'COMPLETED' ||
    searchProgress?.status === 'FAILED' ||
    searchProgress?.status === 'CANCELLED';

  const percent = isFinished
    ? 100
    : totalFound > 0
    ? Math.min(99, Math.round((processed / totalFound) * 100))
    : 20;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Card Principal da Busca */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Nova Prospecção de Empresas Locais
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure a localização, nicho e filtros comerciais para identificar clientes ideais
            </p>
          </div>
        </div>

        <form onSubmit={handleStartSearch} className="space-y-6">
          {/* Seção 1: Localização e Provedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* País */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                País
              </label>
              <input
                type="text"
                disabled
                value={country}
                className="w-full text-sm bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estado
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {states.map((s) => (
                  <option key={s.uf} value={s.name}>
                    {s.name} ({s.uf})
                  </option>
                ))}
              </select>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cidade
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Caldas Novas"
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Provedor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Provedor de Busca
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="GOOGLE_PLACES">Google Places API (Oficial)</option>
                <option value="OPENSTREETMAP">OpenStreetMap (Gratuito Local)</option>
              </select>
            </div>
          </div>

          {/* Seção 2: Categoria & Parâmetros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Categoria / Nicho
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Todas as categorias">Todas as categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="__custom__">+ Criar categoria personalizada...</option>
              </select>
            </div>

            {/* Raio Km */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Raio de Busca
                </label>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {radiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Limite de Resultados */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quantidade Máxima
                </label>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {maxResults} leads
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Categoria personalizada caso selecionada */}
          {categoryName === '__custom__' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nome da Categoria Personalizada:
              </label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ex: Energia Solar, Marcenarias, Estética Automotiva..."
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Seção 3: Filtros Comerciais Avançados */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Filtros Avançados de Oportunidade
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Sem Site */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={onlyWithoutWebsite}
                  onChange={(e) => setOnlyWithoutWebsite(e.target.checked)}
                  className="rounded-md text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Somente empresas sem site
                </span>
              </label>

              {/* Com Telefone */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={onlyWithPhone}
                  onChange={(e) => setOnlyWithPhone(e.target.checked)}
                  className="rounded-md text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Somente com telefone
                </span>
              </label>

              {/* Com WhatsApp */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={onlyWithWhatsapp}
                  onChange={(e) => {
                    setOnlyWithWhatsapp(e.target.checked);
                    if (e.target.checked) setOnlyWithoutWhatsapp(false);
                  }}
                  className="rounded-md text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Somente com WhatsApp
                </span>
              </label>

              {/* Excluir Já Cadastradas */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={excludeExisting}
                  onChange={(e) => setExcludeExisting(e.target.checked)}
                  className="rounded-md text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Excluir já cadastradas
                </span>
              </label>
            </div>

            {/* Filtros de Avaliações e Nota */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Avaliações Máximas
                </label>
                <input
                  type="number"
                  value={maxReviews || ''}
                  onChange={(e) => setMaxReviews(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 50"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Nota Mínima
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={minRating || ''}
                  onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 3.5"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>BUSCAR EMPRESAS</span>
            </button>
          </div>
        </form>
      </div>

      {/* MODAL DE PROGRESSO DA BUSCA (Requisito #6) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buscando e Qualificando Empresas..."
        subtitle="O job está sendo processado na fila assíncrona BullMQ"
        maxWidth="lg"
      >
        <div className="space-y-6 py-2">
          {/* Status e Barra */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                {!isFinished ? (
                  <>
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>Processando via BullMQ...</span>
                  </>
                ) : searchProgress?.status === 'COMPLETED' ? (
                  totalFound === 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Busca Concluída: Nenhuma empresa encontrada
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Busca Concluída com Sucesso!
                      </span>
                    </>
                  )
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-rose-600 font-semibold">Busca Cancelada ou Interrompida</span>
                  </>
                )}
              </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{percent}%</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  searchProgress?.status === 'COMPLETED'
                    ? totalFound === 0
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    : searchProgress?.status === 'CANCELLED'
                    ? 'bg-rose-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Alerta explicativo quando não houver resultados */}
            {isFinished && totalFound === 0 && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Nenhuma empresa encontrada com os filtros atuais
                </p>
                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                  Se você selecionou o <strong>Google Places</strong>, sua chave de API pode estar restrita a outros domínios/IPs no Google Cloud Console. Selecione o provedor <strong>OpenStreetMap</strong> ou amplie o raio de busca para encontrar empresas locais sem restrições.
                </p>
              </div>
            )}
          </div>

          {/* Contadores em tempo real */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500">Encontradas</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {totalFound}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500">Processadas</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {processed} / {totalFound}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Novos Leads</div>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                {searchProgress?.newLeadsCount || 0}
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Duplicados</div>
              <div className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300 mt-0.5">
                {searchProgress?.duplicateCount || 0}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500">Sem Telefone</div>
              <div className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                {searchProgress?.noPhoneCount || 0}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Com WhatsApp</div>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                {searchProgress?.whatsappCount || 0}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-2">
            {!isFinished ? (
              <button
                type="button"
                onClick={handleCancelSearch}
                className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar Busca
              </button>
            ) : (
              <span className="text-xs text-slate-500">Processamento finalizado</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Fechar janela
              </button>

              {isFinished && (
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate('/leads');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <span>Ver Leads Encontrados</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
