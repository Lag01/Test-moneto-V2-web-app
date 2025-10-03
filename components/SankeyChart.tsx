'use client';

import { useEffect, useRef, useState } from 'react';
import { sankey, sankeyLinkHorizontal, sankeyLeft } from 'd3-sankey';
import { select } from 'd3-selection';
import type { MonthlyPlan } from '@/store';
import { formatCurrency } from '@/lib/financial';

interface SankeyNode {
  name: string;
  color?: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface Props {
  plan: MonthlyPlan;
}

export default function SankeyChart({ plan }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!svgRef.current || !plan) return;

    const totalIncome = plan.fixedIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = plan.fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const availableAmount = totalIncome - totalExpenses;

    // Préparer les données pour le diagramme Sankey amélioré
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    let nodeIndex = 0;

    // Noeud source : Revenus totaux
    nodes.push({ name: 'Revenus', color: '#10b981' });
    const revenuesIndex = nodeIndex++;

    // Noeud intermédiaire : Dépenses fixes (si présentes)
    if (plan.fixedExpenses.length > 0) {
      plan.fixedExpenses.forEach((expense) => {
        nodes.push({ name: expense.name, color: '#ef4444' });
        const expenseIndex = nodeIndex++;
        links.push({
          source: revenuesIndex,
          target: expenseIndex,
          value: expense.amount,
        });
      });
    }

    // Noeud intermédiaire : Reste disponible (si présent)
    if (availableAmount > 0 && plan.envelopes.length > 0) {
      nodes.push({ name: 'Disponible', color: '#3b82f6' });
      const availableIndex = nodeIndex++;
      links.push({
        source: revenuesIndex,
        target: availableIndex,
        value: availableAmount,
      });

      // Noeuds des enveloppes depuis le reste disponible
      plan.envelopes.forEach((envelope) => {
        nodes.push({ name: envelope.name, color: '#8b5cf6' });
        const envelopeIndex = nodeIndex++;
        links.push({
          source: availableIndex,
          target: envelopeIndex,
          value: envelope.amount,
        });
      });
    }

    const data: SankeyData = { nodes, links };

    // Configuration du diagramme avec dimensions responsives
    const containerWidth = svgRef.current.parentElement?.offsetWidth || 800;
    const width = Math.min(900, containerWidth);
    const height = Math.min(600, window.innerHeight * 0.7);
    const isMobile = window.innerWidth < 768;
    const margin = isMobile
      ? { top: 20, right: 10, bottom: 20, left: 10 }
      : { top: 20, right: 100, bottom: 20, left: 100 };

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeWidth(isMobile ? 15 : 25)
      .nodePadding(isMobile ? 20 : 30)
      .extent([
        [0, 0],
        [width - margin.left - margin.right, height - margin.top - margin.bottom],
      ])
      .nodeAlign(sankeyLeft);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator(data);

    // Dessiner les liens avec interaction
    g.append('g')
      .selectAll('path')
      .data(sankeyLinks)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', (d: any) => d.source.color || '#cbd5e1')
      .attr('stroke-width', (d: any) => Math.max(1, d.width))
      .attr('opacity', 0.4)
      .on('mouseover', function (event: any, d: any) {
        select(this).attr('opacity', 0.7);
        setTooltip({
          show: true,
          x: event.pageX,
          y: event.pageY,
          content: `${d.source.name} → ${d.target.name}: ${formatCurrency(d.value)}`,
        });
      })
      .on('mouseout', function () {
        select(this).attr('opacity', 0.4);
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      });

    // Dessiner les noeuds avec interaction
    g.append('g')
      .selectAll('rect')
      .data(sankeyNodes)
      .join('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => d.color || '#64748b')
      .attr('opacity', 0.9)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .on('mouseover', function (event: any, d: any) {
        select(this).attr('opacity', 1);
        const value = d.value || 0;
        setTooltip({
          show: true,
          x: event.pageX,
          y: event.pageY,
          content: `${d.name}: ${formatCurrency(value)}`,
        });
      })
      .on('mouseout', function () {
        select(this).attr('opacity', 0.9);
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      });

    // Ajouter les labels avec valeurs
    g.append('g')
      .selectAll('text')
      .data(sankeyNodes)
      .join('text')
      .attr('x', (d: any) => (d.x0 < width / 2 ? d.x1 + 10 : d.x0 - 10))
      .attr('y', (d: any) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => (d.x0 < width / 2 ? 'start' : 'end'))
      .attr('font-size', isMobile ? '10px' : '14px')
      .attr('font-weight', '600')
      .attr('fill', '#1e293b')
      .attr('class', 'dark:fill-slate-200')
      .text((d: any) => d.name);

    // Gérer le resize
    const handleResize = () => {
      if (!svgRef.current || !plan) return;
      // Re-render le chart au resize
      const event = new CustomEvent('resize');
      window.dispatchEvent(event);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [plan]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 md:p-6 relative">
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Diagramme de flux (Sankey)
        </h3>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Visualisation des flux financiers : Revenus → Dépenses → Enveloppes
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full"></svg>
      </div>

      {/* Tooltip interactif */}
      {tooltip.show && (
        <div
          className="fixed z-50 px-3 md:px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs md:text-sm rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Légende */}
      <div className="mt-4 md:mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">LÉGENDE</p>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300">Revenus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300">Dépenses fixes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
            <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300">Enveloppes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
