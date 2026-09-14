import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ScoreBadge } from './ScoreBadge';
import { StatusBadge } from './StatusBadge';

describe('ScoreBadge Component', () => {
  it('deve renderizar score 85 com classificação Muito alta', () => {
    render(<ScoreBadge score={85} />);
    expect(screen.getByText('85')).toBeDefined();
    expect(screen.getByText('(Muito alta)')).toBeDefined();
  });

  it('deve renderizar score 45 com classificação Média', () => {
    render(<ScoreBadge score={45} />);
    expect(screen.getByText('45')).toBeDefined();
    expect(screen.getByText('(Média)')).toBeDefined();
  });
});

describe('StatusBadge Component', () => {
  it('deve exibir badge correto para status NOVO', () => {
    render(<StatusBadge status="NOVO" />);
    expect(screen.getByText('Novo')).toBeDefined();
  });

  it('deve exibir badge correto para status CLIENTE', () => {
    render(<StatusBadge status="CLIENTE" />);
    expect(screen.getByText('Cliente')).toBeDefined();
  });
});
