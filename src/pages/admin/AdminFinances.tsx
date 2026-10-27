/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.tsx';
import { adminService } from '../../services/adminService.ts';
import { formatFCFA } from '../../data.ts';

interface AdminFinancesProps {
  go: (route: string) => void;
}

export const AdminFinances: React.FC<AdminFinancesProps> = ({ go }) => {
  const [stats, setStats] = useState(adminService.getDashboardStats());

  useEffect(() => {
    setStats(adminService.getDashboardStats());
  }, []);

  const paymentBreakdown = [
    { name: 'Wave CI', share: 0.52, feePct: 0.015, color: '#1dc4ff' },
    { name: 'Orange Money CI', share: 0.28, feePct: 0.025, color: '#ff7900' },
    { name: 'MTN Mobile Money / Moov', share: 0.12, feePct: 0.025, color: '#ffcc00' },
    { name: 'Carte Bancaire (Visa / Mastercard)', share: 0.08, feePct: 0.035, color: '#1a1f71' }
  ];

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['CANAL,PART,MONTANT_BRUT_FCFA,FRAIS_ESTIMES_FCFA,SOLDE_NET_FCFA']
        .concat(
          paymentBreakdown.map((pm) => {
            const gross = Math.round(stats.totalRevenue * pm.share);
            const fee = Math.round(gross * pm.feePct);
            const net = gross - fee;
            return `${pm.name},${(pm.share * 100).toFixed(0)}%,${gross},${fee},${net}`;
          })
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BILAN_FINANCIER_MAF26_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout currentRoute="/admin/finances" go={go}>
      <div className="space-y-6 select-none font-admin">
        {/* Titre & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bilan financier de billetterie
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Encaissements, commissions des passerelles de paiement et trésorerie nette.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>↓</span>
            <span>Exporter le bilan CSV</span>
          </button>
        </div>

        {/* 1. Cartes de synthèse financière blanche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Recettes brutes encaissées
            </span>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {formatFCFA(stats.totalRevenue)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Montant total payé par les festivaliers
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Commissions passerelles (~3.5%)
            </span>
            <div className="text-3xl font-bold text-rose-600 mt-2">
              - {formatFCFA(Math.round(stats.totalRevenue * 0.035))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Frais d'intermédiation Wave, Orange Money et CB
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Solde net disponible festival
            </span>
            <div className="text-3xl font-bold text-emerald-600 mt-2">
              {formatFCFA(stats.netTicketing)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Fonds nets reversés sur le compte festival
            </p>
          </div>
        </div>

        {/* 2. Tableau de ventilation par passerelle de paiement */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Ventilation par canal de paiement & passerelle
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Répartition des encaissements et détail des frais prélevés à la source.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Passerelle / Moyen</th>
                  <th className="py-3.5 px-4">Part des flux</th>
                  <th className="py-3.5 px-4">Recettes brutes</th>
                  <th className="py-3.5 px-4">Taux de frais</th>
                  <th className="py-3.5 px-4">Frais estimés</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Net festival</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentBreakdown.map((pm) => {
                  const gross = Math.round(stats.totalRevenue * pm.share);
                  const fee = Math.round(gross * pm.feePct);
                  const net = gross - fee;

                  return (
                    <tr key={pm.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900 text-xs sm:text-sm">
                        {pm.name}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-700">
                        {(pm.share * 100).toFixed(0)}%
                      </td>
                      <td className="py-4 px-4 font-semibold text-xs sm:text-sm text-slate-900">
                        {formatFCFA(gross)}
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-600">
                        {(pm.feePct * 100).toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-rose-600">
                        - {formatFCFA(fee)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right font-bold text-xs sm:text-sm text-emerald-700">
                        {formatFCFA(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
