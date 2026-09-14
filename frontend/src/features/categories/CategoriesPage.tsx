import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, Plus, Search, Trash2, Folder } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import { Modal } from '../../components/ui/Modal';
import { Category } from '../../types';

export const CategoriesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const { data: categories = [], isLoading, refetch } = useQuery<Category[]>({
    queryKey: ['categories-management'],
    queryFn: () => categoryService.getCategories(),
  });

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryService.createCategory(newCatName.trim());
      setNewCatName('');
      setIsModalOpen(false);
      refetch();
    } catch (e: any) {
      alert(`Erro ao criar categoria: ${e.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remover a categoria "${name}"?`)) {
      try {
        await categoryService.deleteCategory(id);
        refetch();
      } catch (e) {
        console.error('Erro ao excluir:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Categorias & Nichos de Mercado
          </h2>
          <p className="text-xs text-slate-500">
            Segmentos comerciais cadastrados para prospecção direcionada
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Busca de Categorias */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar categorias..."
          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {isLoading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))
        ) : (
          filteredCategories.map((c) => (
            <div
              key={c.id}
              className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-blue-400 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Folder className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {c._count?.leads || 0} leads
                  </div>
                </div>
              </div>

              {c.isCustom && (
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                  title="Excluir categoria customizada"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Nova Categoria */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Categoria Personalizada"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Categoria:
            </label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex: Fabricantes de Esquadrias, Estética Automotiva..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              Salvar Categoria
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
