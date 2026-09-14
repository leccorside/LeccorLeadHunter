import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral consolidada do funil e oportunidades' },
  '/search': { title: 'Buscar Leads', subtitle: 'Localize empresas locais via Google Places ou OpenStreetMap' },
  '/leads': { title: 'Gestão de Leads', subtitle: 'Listagem completa, filtros avançados e contato direto' },
  '/kanban': { title: 'Funil Kanban', subtitle: 'Acompanhe visualmente cada etapa da negociação comercial' },
  '/map': { title: 'Mapa de Oportunidades', subtitle: 'Distribuição geográfica e localização dos leads' },
  '/campaigns': { title: 'Campanhas', subtitle: 'Estratégias de prospecção com cálculo de conversão' },
  '/messages': { title: 'Templates de Mensagens', subtitle: 'Mensagens pré-configuradas com variáveis para WhatsApp' },
  '/categories': { title: 'Categorias de Mercado', subtitle: 'Nichos e segmentos comerciais' },
  '/history': { title: 'Histórico de Atividades', subtitle: 'Linha do tempo e auditoria de ações' },
  '/settings': { title: 'Configurações do Sistema', subtitle: 'Chaves de API, parâmetros do score e backup' },
};

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentMeta = pageTitles[location.pathname] || {
    title: 'LeadHunter Local',
    subtitle: 'CRM e Prospecção Comercial Local',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar fixo para desktop e drawer para mobile */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Área principal */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
