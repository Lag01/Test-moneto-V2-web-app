'use client';

import { useState } from 'react';
import type { Envelope } from '@/store';
import PercentageSlider from './PercentageSlider';
import { formatCurrency } from '@/lib/financial';
import {
  getTotalPercentage,
  normalizeEnvelopePercentages,
  separateEnvelopesByType,
  calculateFixedEnvelopesTotal,
  recalculateEnvelopeAmounts
} from '@/lib/monthly-plan';

interface Props {
  envelopes: Envelope[];
  availableAmount: number;
  onChange: (envelopes: Envelope[]) => void;
  onAutoAdjust?: () => void;
}

const ENVELOPE_COLORS = [
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f97316', // Orange
  '#14b8a6', // Teal
];

export default function EnvelopeAllocator({
  envelopes,
  availableAmount,
  onChange,
  onAutoAdjust,
}: Props) {
  const [newEnvelopeName, setNewEnvelopeName] = useState('');
  const [newEnvelopeType, setNewEnvelopeType] = useState<'percentage' | 'fixed'>('percentage');

  const { fixed, percentage } = separateEnvelopesByType(envelopes);
  const fixedTotal = calculateFixedEnvelopesTotal(envelopes);
  const availableForPercentage = availableAmount - fixedTotal;

  const totalPercentage = getTotalPercentage(envelopes);
  const isValid = percentage.length === 0 || Math.abs(totalPercentage - 100) < 0.01;
  const remainingPercentage = 100 - totalPercentage;

  const handlePercentageChange = (id: string, newPercentage: number) => {
    const updated = recalculateEnvelopeAmounts(
      envelopes.map((env) => {
        if (env.id === id && env.type === 'percentage') {
          return { ...env, percentage: newPercentage };
        }
        return env;
      }),
      availableAmount
    );
    onChange(updated);
  };

  const handleFixedAmountChange = (id: string, newAmount: number) => {
    const updated = envelopes.map((env) => {
      if (env.id === id && env.type === 'fixed') {
        return { ...env, amount: newAmount };
      }
      return env;
    });
    // Recalculer les montants des enveloppes en % car le disponible a changé
    onChange(recalculateEnvelopeAmounts(updated, availableAmount));
  };

  const handleToggleType = (id: string) => {
    const updated = envelopes.map((env) => {
      if (env.id === id) {
        if (env.type === 'percentage') {
          // Passer de % à fixe : garder le montant calculé actuel
          return { ...env, type: 'fixed' as const };
        } else {
          // Passer de fixe à % : calculer le % équivalent
          const newPercentage = availableForPercentage > 0
            ? (env.amount / availableForPercentage) * 100
            : 0;
          return { ...env, type: 'percentage' as const, percentage: newPercentage };
        }
      }
      return env;
    });
    onChange(recalculateEnvelopeAmounts(updated, availableAmount));
  };

  const handleDelete = (id: string) => {
    onChange(envelopes.filter((env) => env.id !== id));
  };

  const handleAddEnvelope = () => {
    if (!newEnvelopeName.trim()) return;

    const newEnvelope: Envelope = {
      id: `env-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newEnvelopeName.trim(),
      type: newEnvelopeType,
      percentage: newEnvelopeType === 'percentage' ? Math.max(0, remainingPercentage) : 0,
      amount: newEnvelopeType === 'percentage'
        ? (availableForPercentage * Math.max(0, remainingPercentage)) / 100
        : 0,
    };

    onChange([...envelopes, newEnvelope]);
    setNewEnvelopeName('');
  };

  const handleAutoNormalize = () => {
    const normalized = normalizeEnvelopePercentages(envelopes);
    const updated = recalculateEnvelopeAmounts(normalized, availableAmount);
    onChange(updated);
    if (onAutoAdjust) onAutoAdjust();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* En-tête avec montant disponible */}
      <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5 md:p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-200">Montant disponible total</h2>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 ml-13">{formatCurrency(availableAmount)}</p>

        {fixed.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Enveloppes fixes :</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(fixedTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-600 dark:text-slate-400">Disponible pour répartition % :</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(availableForPercentage)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation - Badge discret */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isValid ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Répartition valide (100%)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {remainingPercentage > 0
                  ? `Reste ${remainingPercentage.toFixed(1)}% à répartir`
                  : `Dépassement de ${Math.abs(remainingPercentage).toFixed(1)}%`}
              </span>
            </div>
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Total : {totalPercentage.toFixed(1)}%
          </span>
        </div>

        <button
          onClick={handleAutoNormalize}
          disabled={isValid}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors min-h-[44px] disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-300 dark:disabled:hover:bg-slate-600"
        >
          Ajuster à 100%
        </button>
      </div>

      {/* Liste des enveloppes */}
      <div className="space-y-4">
        {envelopes.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg mb-2">Aucune enveloppe créée</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              Ajoutez votre première enveloppe ci-dessous
            </p>
          </div>
        ) : (
          <>
            {/* Enveloppes fixes */}
            {fixed.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Enveloppes à montant fixe
                </h3>
                <div className="space-y-3">
                  {fixed.map((envelope, index) => (
                    <PercentageSlider
                      key={envelope.id}
                      id={envelope.id}
                      name={envelope.name}
                      type={envelope.type}
                      percentage={envelope.percentage}
                      amount={envelope.amount}
                      availableForPercentage={availableForPercentage}
                      onChange={handlePercentageChange}
                      onAmountChange={handleFixedAmountChange}
                      onToggleType={handleToggleType}
                      onDelete={handleDelete}
                      color={ENVELOPE_COLORS[index % ENVELOPE_COLORS.length]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Enveloppes en pourcentage */}
            {percentage.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Enveloppes en pourcentage
                </h3>
                <div className="space-y-3">
                  {percentage.map((envelope, index) => (
                    <PercentageSlider
                      key={envelope.id}
                      id={envelope.id}
                      name={envelope.name}
                      type={envelope.type}
                      percentage={envelope.percentage}
                      amount={envelope.amount}
                      availableForPercentage={availableForPercentage}
                      onChange={handlePercentageChange}
                      onAmountChange={handleFixedAmountChange}
                      onToggleType={handleToggleType}
                      onDelete={handleDelete}
                      color={ENVELOPE_COLORS[(fixed.length + index) % ENVELOPE_COLORS.length]}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 md:p-5 border border-slate-200 dark:border-slate-700">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Ajouter une enveloppe personnalisée
        </h3>

        {/* Toggle du type d'enveloppe */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setNewEnvelopeType('percentage')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              newEnvelopeType === 'percentage'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            En pourcentage
          </button>
          <button
            onClick={() => setNewEnvelopeType('fixed')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              newEnvelopeType === 'fixed'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Montant fixe
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <input
            type="text"
            value={newEnvelopeName}
            onChange={(e) => setNewEnvelopeName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEnvelope()}
            placeholder="Ex: Vacances, Projet, etc."
            className="flex-1 px-4 py-3 md:py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
          <button
            onClick={handleAddEnvelope}
            disabled={!newEnvelopeName.trim()}
            className="px-6 py-3 md:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {/* Info sur le type sélectionné */}
        {newEnvelopeType === 'percentage' && !isValid && remainingPercentage > 0 && (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Sera initialisée à <span className="font-semibold">{remainingPercentage.toFixed(1)}%</span>
          </div>
        )}
        {newEnvelopeType === 'fixed' && (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Vous pourrez définir le montant fixe après l&apos;ajout
          </div>
        )}
      </div>

      {/* Résumé */}
      {envelopes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Enveloppes</p>
              <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{envelopes.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Alloué</p>
              <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                {formatCurrency((availableAmount * totalPercentage) / 100)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
