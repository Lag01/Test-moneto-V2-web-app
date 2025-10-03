'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyPlan } from '@/store';
import { formatCurrency } from '@/lib/financial';

interface Props {
  plan: MonthlyPlan;
}

export default function WaterfallChart({ plan }: Props) {
  // Calculer les valeurs pour le waterfall
  const totalIncome = plan.fixedIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = plan.fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const availableAmount = totalIncome - totalExpenses;
  const totalEnvelopes = plan.envelopes.reduce((sum, env) => sum + env.amount, 0);
  const finalBalance = availableAmount - totalEnvelopes;

  // Construire les données en cascade
  let cumulative = 0;

  const data = [
    {
      name: 'Revenus',
      value: totalIncome,
      start: 0,
      end: totalIncome,
      fill: '#10b981',
    },
    {
      name: 'Dépenses fixes',
      value: -totalExpenses,
      start: totalIncome,
      end: availableAmount,
      fill: '#ef4444',
    },
    {
      name: 'Disponible',
      value: availableAmount,
      start: 0,
      end: availableAmount,
      fill: '#3b82f6',
    },
  ];

  // Ajouter chaque enveloppe
  let envelopeCumulative = availableAmount;
  plan.envelopes.forEach((envelope, index) => {
    const start = envelopeCumulative;
    const end = start - envelope.amount;
    data.push({
      name: envelope.name,
      value: -envelope.amount,
      start,
      end,
      fill: ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'][index % 4],
    });
    envelopeCumulative = end;
  });

  // Solde final
  data.push({
    name: 'Solde final',
    value: finalBalance,
    start: 0,
    end: finalBalance,
    fill: finalBalance >= 0 ? '#10b981' : '#ef4444',
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-300 rounded shadow-lg">
          <p className="font-semibold text-slate-800">{data.name}</p>
          <p className="text-sm text-slate-600">
            Montant : {formatCurrency(Math.abs(data.value))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Graphique en cascade (Waterfall)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={(value) => `${value.toLocaleString('fr-FR')} €`}
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-green-700 font-medium">Revenus</p>
          <p className="text-lg font-bold text-green-800">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <p className="text-sm text-red-700 font-medium">Dépenses</p>
          <p className="text-lg font-bold text-red-800">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-blue-700 font-medium">Disponible</p>
          <p className="text-lg font-bold text-blue-800">{formatCurrency(availableAmount)}</p>
        </div>
        <div className={`${finalBalance >= 0 ? 'bg-emerald-50' : 'bg-red-50'} p-3 rounded`}>
          <p
            className={`text-sm font-medium ${
              finalBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            Solde final
          </p>
          <p
            className={`text-lg font-bold ${
              finalBalance >= 0 ? 'text-emerald-800' : 'text-red-800'
            }`}
          >
            {formatCurrency(finalBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}
