import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Plus, Edit2, Trash2, Check, Copy } from 'lucide-react';
import { messageService } from '../../services/message.service';
import { categoryService } from '../../services/category.service';
import { Modal } from '../../components/ui/Modal';
import { MessageTemplate } from '../../types';

export const MessagesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const { data: templates = [], isLoading, refetch } = useQuery<MessageTemplate[]>({
    queryKey: ['message-templates'],
    queryFn: () => messageService.getTemplates(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-templates'],
    queryFn: () => categoryService.getCategories(),
  });

  const variables = [
    { tag: '{{nome}}', desc: 'Nome do responsável' },
    { tag: '{{empresa}}', desc: 'Nome da empresa' },
    { tag: '{{cidade}}', desc: 'Cidade da empresa' },
    { tag: '{{estado}}', desc: 'Estado da empresa' },
    { tag: '{{categoria}}', desc: 'Nicho/Categoria' },
    { tag: '{{site}}', desc: 'URL do site atual' },
    { tag: '{{telefone}}', desc: 'Telefone da empresa' },
  ];

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setName('');
    setContent(
      'Olá {{nome}}, tudo bem? Encontrei a {{empresa}} em {{cidade}} e percebi que vocês ainda não possuem um site otimizado...',
    );
    setCategoryId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tmpl: MessageTemplate) => {
    setEditingTemplate(tmpl);
    setName(tmpl.name);
    setContent(tmpl.content);
    setCategoryId(tmpl.categoryId || '');
    setIsModalOpen(true);
  };

  const handleInsertVariable = (tag: string) => {
    setContent((prev) => prev + ` ${tag} `);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await messageService.updateTemplate(editingTemplate.id, {
          name,
          content,
          categoryId: categoryId || undefined,
        });
      } else {
        await messageService.createTemplate({
          name,
          content,
          categoryId: categoryId || undefined,
        });
      }
      setIsModalOpen(false);
      refetch();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    }
  };

  const handleDelete = async (id: string, tmplName: string) => {
    if (confirm(`Deseja remover o template "${tmplName}"?`)) {
      try {
        await messageService.deleteTemplate(id);
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
            Templates de Mensagens para WhatsApp
          </h2>
          <p className="text-xs text-slate-500">
            Configure mensagens personalizadas com substituição automática de dados da empresa
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Template</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {tmpl.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tmpl)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tmpl.id, tmpl.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Balão do WhatsApp */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {tmpl.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{tmpl.category?.name ? `Focado em: ${tmpl.category.name}` : 'Geral (Qualquer nicho)'}</span>
                <span>{tmpl.isActive ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Template */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Editar Template' : 'Novo Template de Mensagem'}
        subtitle="As variáveis serão substituídas pelos dados de cada lead ao disparar"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome de Identificação:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Abordagem para Empresas Sem Site"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vincular a Categoria (Opcional):
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            >
              <option value="">Geral / Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variáveis Dinâmicas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clique em uma tag para inserir no texto:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  type="button"
                  key={v.tag}
                  onClick={() => handleInsertVariable(v.tag)}
                  className="px-2 py-1 text-[11px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-md border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
                  title={v.desc}
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo da Mensagem */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Texto da Mensagem:
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          {/* Prévia simulada */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Pré-visualização estimada:
            </label>
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {content
                .replace(/{{\s*nome\s*}}/gi, 'Paulo')
                .replace(/{{\s*empresa\s*}}/gi, 'Restaurante Exemplo')
                .replace(/{{\s*cidade\s*}}/gi, 'Caldas Novas')
                .replace(/{{\s*estado\s*}}/gi, 'GO')
                .replace(/{{\s*categoria\s*}}/gi, 'Restaurantes')
                .replace(/{{\s*site\s*}}/gi, 'sem site')
                .replace(/{{\s*telefone\s*}}/gi, '(64) 99999-8888')}
            </div>
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
              Salvar Template
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
