/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.tsx';
import { adminService } from '../../services/adminService.ts';
import { passService, FestivalPass } from '../../services/passService.ts';
import { formatFCFA } from '../../data.ts';

interface AdminDashboardProps {
  go: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ go }) => {
  const [stats, setStats] = useState(adminService.getDashboardStats());
  const [passes, setPasses] = useState<FestivalPass[]>([]);

  useEffect(() => {
    setStats(adminService.getDashboardStats());
    setPasses(passService.getAllPasses());
  }, []);

  return (
    <AdminLayout currentRoute="/admin" go={go}>
      <div className="space-y-8 select-none">
        {/* Titre de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tableau de bord de gestion
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Vue synthétique des ventes, quotas et encaissements de l'édition 2026.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Billetterie ouverte
            </span>
          </div>
        </div>

        {/* 1. Cartes d'indicateurs clés (KPIs) - Style commercial blanc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Chiffre d'Affaires Brut */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Chiffre d'affaires brut
              </span>
              <span className="p-1.5 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">
                FCFA
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              {formatFCFA(stats.totalRevenue)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Total cumulé des commandes encaissées
            </p>
          </div>

          {/* Net Billetterie Estimé */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Solde net estimé
              </span>
              <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-medium">
                Net
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-3">
              {formatFCFA(stats.netTicketing)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Après déduction des passerelles (~3.5%)
            </p>
          </div>

          {/* Billets Émis / Capacité */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Billets vendus
              </span>
              <span className="p-1.5 rounded-md bg-purple-50 text-purple-600 text-xs font-medium">
                {stats.occupancyRate}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              {stats.totalTicketsSold.toLocaleString()} <span className="text-base font-normal text-slate-400">/ {stats.totalCapacity.toLocaleString()}</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-2">
              Taux de remplissage : {stats.occupancyRate}%
            </p>
          </div>

          {/* Nombre de Commandes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Commandes validées
              </span>
              <span className="p-1.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                Paniers
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              {stats.ordersCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Transactions confirmées par Wave & OM
            </p>
          </div>
        </div>

        {/* 2. Tableau de suivi des quotas de pass */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Suivi des quotas par catégorie de pass
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Capacité disponible et avancement des ventes par tarif.
              </p>
            </div>
            <button
              type="button"
              onClick={() => go('/admin/billetterie')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer self-start sm:self-auto"
            >
              Gérer la billetterie & tarifs →
            </button>
          </div>

          <div className="divide-y divide-slate-100 p-6 space-y-5">
            {passes.map((p) => {
              const pct = Math.min(100, Math.round((p.quotaSold / (p.quotaTotal || 1)) * 100));
              const isFull = p.status === 'SOLD_OUT' || pct >= 100;

              return (
                <div key={p.id} className="pt-2 first:pt-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-sm text-slate-900">
                        {p.name}
                      </span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {p.price}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({p.days})
                      </span>
                      {isFull && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[11px] font-semibold rounded border border-red-200">
                          Épuisé
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-700">
                      <strong className="text-slate-900">{p.quotaSold.toLocaleString()}</strong> / {p.quotaTotal.toLocaleString()} vendus ({pct}%)
                    </div>
                  </div>

                  {/* Barre de progression épurée */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Accès rapides aux fonctions opérationnelles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => go('/admin/controle-acces')}
            className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-3">
              📱
            </div>
            <h3 className="font-semibold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
              Contrôle d'accès & Scanner
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Scanner et valider les QR codes festivaliers aux portiques d'entrée en temps réel.
            </p>
          </button>

          <button
            type="button"
            onClick={() => go('/admin/billetterie')}
            className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
              🎫
            </div>
            <h3 className="font-semibold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
              Pass & Tarifs
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Ajouter de nouvelles catégories de pass, ajuster les tarifs FCFA et définir les quotas.
            </p>
          </button>

          <button
            type="button"
            onClick={() => go('/admin/commandes')}
            className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-3">
              📋
            </div>
            <h3 className="font-semibold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
              Commandes & Paniers
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Auditer les transactions, rechercher par nom ou référence et gérer les remboursements.
            </p>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
