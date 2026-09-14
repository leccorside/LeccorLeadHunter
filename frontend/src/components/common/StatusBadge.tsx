import React from 'react';
import { LeadStatus } from '../../types';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; dot: string }
> = {
  NOVO: {
    label: 'Novo',
    bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  NAO_CONTATADO: {
    label: 'Não Contatado',
    bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  CONTATADO: {
    label: 'Contatado',
    bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  RESPONDEU: {
    label: 'Respondeu',
    bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  INTERESSADO: {
    label: 'Interessado',
    bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    dot: 'bg-cyan-500',
  },
  NEGOCIACAO: {
    label: 'Em Negociação',
    bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
  },
  CLIENTE: {
    label: 'Cliente',
    bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  SEM_INTERESSE: {
    label: 'Sem Interesse',
    bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  FOLLOW_UP: {
    label: 'Follow-up',
    bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  ARQUIVADO: {
    label: 'Arquivado',
    bg: 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    dot: 'bg-gray-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const config = statusConfig[status] || statusConfig.NOVO;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs whitespace-nowrap shrink-0 ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
};
