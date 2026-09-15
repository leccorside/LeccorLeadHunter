import React, { useState } from 'react';
import { MessageSquare, ExternalLink, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Lead, MessageTemplate, WhatsAppStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { messageService } from '../../services/message.service';
import { leadService } from '../../services/lead.service';

interface WhatsAppButtonProps {
  lead: Lead;
  variant?: 'button' | 'icon' | 'table';
  templates?: MessageTemplate[];
  onContactRecorded?: () => void;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  lead,
  variant = 'table',
  templates = [],
  onContactRecorded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [whatsAppLink, setWhatsAppLink] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const phone = lead.normalizedPhone || lead.phone;
  const isVerified = lead.whatsappStatus === 'VERIFIED';
  const isUnknown = lead.whatsappStatus === 'UNKNOWN';
  const isNotFound = lead.whatsappStatus === 'NOT_FOUND';

  const formatWhatsAppWebLink = (targetPhone: string, text: string) => {
    let digits = targetPhone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = digits.substring(1);
    if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
      digits = `55${digits}`;
    }
    const encoded = encodeURIComponent(text);
    return `https://web.whatsapp.com/send?phone=${digits}${encoded ? `&text=${encoded}` : ''}`;
  };

  const handleOpenModal = async () => {
    if (!phone) return;

    setIsOpen(true);
    // Se tiver templates, seleciona o primeiro
    const defaultTmpl = templates.length > 0 ? templates[0].id : '';
    setSelectedTemplateId(defaultTmpl);

    if (defaultTmpl) {
      loadPreview(defaultTmpl);
    } else {
      // Mensagem padrão
      const defaultMsg = `Olá, tudo bem? Encontrei a ${lead.name} em ${lead.city || 'sua região'} e gostaria de falar sobre a presença digital da empresa.`;
      const link = formatWhatsAppWebLink(phone, defaultMsg);
      setPreviewText(defaultMsg);
      setWhatsAppLink(link);
    }
  };

  const loadPreview = async (tmplId: string) => {
    try {
      setLoadingPreview(true);
      const preview = await messageService.getPreview(tmplId, lead.id);
      setPreviewText(preview.message);
      let link = preview.whatsAppLink;
      if (link && link.includes('wa.me/')) {
        link = link.replace('https://wa.me/', 'https://web.whatsapp.com/send?phone=').replace('?text=', '&text=');
      }
      setWhatsAppLink(link || formatWhatsAppWebLink(phone, preview.message));
    } catch (e) {
      console.error('Erro ao gerar preview de WhatsApp:', e);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    loadPreview(tmplId);
  };

  const handleConfirmContact = async () => {
    // 1. Abre a janela do WhatsApp
    if (whatsAppLink) {
      window.open(whatsAppLink, '_blank', 'noopener,noreferrer');
    }

    // 2. Registra o contato e atualiza status no backend
    try {
      await leadService.recordContact(
        lead.id,
        'WHATSAPP',
        previewText,
        selectedTemplateId || undefined,
      );
      if (onContactRecorded) {
        onContactRecorded();
      }
    } catch (e) {
      console.error('Erro ao registrar contato:', e);
    }

    setIsOpen(false);
  };

  // Se o lead não possui telefone ou foi classificado como NOT_FOUND (fixo ou sem WhatsApp)
  if (!phone || lead.whatsappStatus === 'NOT_FOUND') {
    if (variant === 'button') {
      return (
        <button
          disabled
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
        >
          <XCircle className="w-4 h-4 text-slate-400" />
          <span>{!phone ? 'Sem Telefone' : 'Sem WhatsApp (Telefone Fixo)'}</span>
        </button>
      );
    }

    return (
      <span
        title={!phone ? 'Empresa sem telefone cadastrado' : 'Telefone fixo ou número sem WhatsApp ativo'}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200 dark:border-slate-800 whitespace-nowrap shrink-0"
      >
        <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Sem WhatsApp</span>
      </span>
    );
  }

  return (
    <>
      {variant === 'table' && (
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          {/* Indicador de status de verificação */}
          <span title={isVerified ? 'WhatsApp Verificado' : 'Celular identificado (+55 com 9º dígito)'}>
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full shrink-0">
                ?
              </span>
            )}
          </span>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80 transition-colors border border-emerald-200 dark:border-emerald-800 shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      )}

      {variant === 'button' && (
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contato pelo WhatsApp</span>
        </button>
      )}

      {/* Modal de confirmação e seleção de template */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Iniciar Contato pelo WhatsApp"
        subtitle={`Empresa: ${lead.name} • Tel: ${lead.phone || lead.normalizedPhone}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Seletor de Templates */}
          {templates.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selecione o Template de Mensagem:
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pré-visualização do Balão de Conversa estilo WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preview da Mensagem:
            </label>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="max-w-[85%] bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl rounded-tl-xs p-3 shadow-xs">
                {loadingPreview ? (
                  <div className="text-xs text-slate-400 italic">Carregando preview...</div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {previewText}
                  </p>
                )}
                <div className="text-right text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Agora • Enviada via LeadHunter
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            ⚠️ A conversa será aberta diretamente no WhatsApp Web com a mensagem acima preenchida. O envio final é feito por você. O LeadHunter atualizará automaticamente o status do lead para <strong>CONTATADO</strong>.
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmContact}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir no WhatsApp Web</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
