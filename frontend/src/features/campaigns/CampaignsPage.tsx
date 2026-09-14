import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Plus, Users, MessageSquare, CheckCircle, TrendingUp, Trash2 } from 'lucide-react';
import { campaignService } from '../../services/campaign.service';
import { categoryService } from '../../services/category.service';
import { Modal } from '../../components/ui/Modal';
import { Campaign } from '../../types';

export const CampaignsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCity, setTargetCity] = useState('Caldas Novas');
  const [targetCategory, setTargetCategory] = useState('');
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState(true);

  const { data: campaigns = [], isLoading, refetch } = useQuery<Campaign[]>({
    queryKey: ['campaigns-list'],
    queryFn: () => campaignService.getCampaigns(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-campaigns'],
    queryFn: () => categoryService.getCategories(),
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await campaignService.createCampaign({
        name,
        description,
        filtersJson: {
          city: targetCity,
          categoryId: targetCategory || undefined,
          hasWebsite: !onlyWithoutWebsite,
        },
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      refetch();
    } catch (e: any) {
      alert(`Erro ao criar campanha: ${e.message}`);
    }
  };

  const handleDeleteCampaign = async (id: string, campName: string) => {
    if (confirm(`Deseja remover a campanha "${campName}"?`)) {
      try {
        await campaignService.deleteCampaign(id);
        refetch();
      } catch (e) {
        console.error('Erro ao excluir:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Campanhas de Prospecção Comercial
          </h2>
          <p className="text-xs text-slate-500">
            Defina públicos-alvo segmentados e acompanhe a taxa de conversão em cada etapa
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Campanha</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Nenhuma campanha criada
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Crie campanhas para focar em nichos específicos, como "Restaurantes sem site em Caldas Novas".
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
          >
            Começar Nova Campanha
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((camp) => {
            const conversionRate =
              camp.totalFound > 0
                ? ((camp.totalConverted / camp.totalFound) * 100).toFixed(1)
                : '0.0';

            return (
              <div
                key={camp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {camp.name}
                    </h3>
                    {camp.description && (
                      <p className="text-xs text-slate-500">{camp.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Métricas do Funil da Campanha */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-500 block">Total</span>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      {camp.totalFound}
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                    <span className="text-[10px] font-semibold text-amber-600 block">Contatados</span>
                    <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-300">
                      {camp.totalContacted}
                    </span>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl">
                    <span className="text-[10px] font-semibold text-purple-600 block">Respondeu</span>
                    <span className="text-base font-bold font-mono text-purple-700 dark:text-purple-300">
                      {camp.totalResponded}
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    <span className="text-[10px] font-semibold text-emerald-600 block">Clientes</span>
                    <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {camp.totalConverted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    Conversão Total: <strong>{conversionRate}%</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Criada em: {new Date(camp.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar Campanha */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Campanha de Prospecção"
        subtitle="Agrupe os leads sob uma estratégia comercial direcionada"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Campanha:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Restaurantes sem site em Caldas Novas"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição ou Objetivo:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Venda de cardápio digital e site institucional"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cidade Alvo:
              </label>
              <input
                type="text"
                required
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria Alvo:
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyWithoutWebsite}
              onChange={(e) => setOnlyWithoutWebsite(e.target.checked)}
              className="rounded-md text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Focar apenas em empresas sem website</span>
          </label>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
            >
              Salvar Campanha
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
