import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  let bgColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let label = 'Baixa';

  if (score >= 80) {
    bgColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    label = 'Muito alta';
  } else if (score >= 60) {
    bgColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    label = 'Alta';
  } else if (score >= 40) {
    bgColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    label = 'Média';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm whitespace-nowrap shrink-0 ${bgColor} ${sizeClasses[size]}`}
      title={`Score de Oportunidade: ${score}/100 (${label})`}
    >
      <span className="tabular-nums font-mono font-bold whitespace-nowrap">{score}</span>
      {showLabel && <span className="opacity-80 font-normal whitespace-nowrap">({label})</span>}
    </span>
  );
};
