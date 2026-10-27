/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.tsx';
import { adminService, AccessScanLog } from '../../services/adminService.ts';

interface AdminAccessControlProps {
  go: (route: string) => void;
}

export const AdminAccessControl: React.FC<AdminAccessControlProps> = ({ go }) => {
  const [inputCode, setInputCode] = useState('');
  const [selectedGate, setSelectedGate] = useState('Porte Sud - Entrée Principale');
  const [agentName] = useState('Agent K. Yves');
  const [lastResult, setLastResult] = useState<AccessScanLog | null>(null);
  const [scanLogs, setScanLogs] = useState<AccessScanLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setScanLogs(adminService.getScanLogs());
  }, []);

  const handleValidate = async (codeToTest?: string) => {
    const code = (codeToTest || inputCode).trim();
    if (!code) return;

    setIsScanning(true);
    setTimeout(async () => {
      const res = await adminService.scanAndValidateTicket(code, agentName, selectedGate);
      setLastResult(res);
      setScanLogs(adminService.getScanLogs());
      setInputCode('');
      setIsScanning(false);
    }, 120);
  };

  const decisionBadges: Record<string, { label: string; badgeClass: string }> = {
    AUTHORIZED: { label: 'Accès autorisé', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ALREADY_USED: { label: 'Déjà scanné', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    CANCELLED: { label: 'Billet annulé', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
    INVALID: { label: 'Code inconnu', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  return (
    <AdminLayout currentRoute="/admin/controle-acces" go={go}>
      <div className="space-y-6 select-none font-admin">
        {/* Titre & Configuration Portique */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Poste de contrôle d'accès
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Validation des billets festivaliers en temps réel et détection des fraudes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 uppercase">Portique :</span>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="Porte Sud - Entrée Principale">Porte Sud - Entrée Principale</option>
              <option value="Porte Nord - Accès VIP & Presse">Porte Nord - Accès VIP & Presse</option>
              <option value="Porte Ouest - Backstage & Staff">Porte Ouest - Backstage & Staff</option>
            </select>
          </div>
        </div>

        {/* Console de Scan Rapide - Style Blanc Épuré */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Saisie manuelle ou lecture douchette QR Code :
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                placeholder="Ex: MAF26-GP-948210 ou scanner le code-barres..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleValidate()}
                disabled={isScanning || !inputCode.trim()}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs ${
                  isScanning || !inputCode.trim()
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isScanning ? 'Vérification...' : 'Valider le billet'}
              </button>
            </div>
          </div>

          {/* Boutons de test rapide opérateur */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Boutons de test rapide :</span>
            <button
              type="button"
              onClick={() => handleValidate('MAF26-GP-948210')}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 hover:bg-slate-100 cursor-pointer font-mono text-[11px]"
            >
              Billet Valide GP
            </button>
            <button
              type="button"
              onClick={() => handleValidate('MAF26-VIP-448102')}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 hover:bg-slate-100 cursor-pointer font-mono text-[11px]"
            >
              Billet Valide VIP
            </button>
            <button
              type="button"
              onClick={() => handleValidate('MAF26-FAUX-999999')}
              className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded text-rose-700 hover:bg-rose-100 cursor-pointer font-mono text-[11px]"
            >
              Faux Billet Invalide
            </button>
          </div>

          {/* Résultat visuel instantané du scan */}
          {lastResult && (
            <div
              className={`p-4 rounded-lg border text-sm flex items-start justify-between gap-4 transition-all ${
                lastResult.result === 'AUTHORIZED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : lastResult.result === 'ALREADY_USED'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">
                    {lastResult.result === 'AUTHORIZED'
                      ? '✓ ENTRÉE AUTORISÉE'
                      : lastResult.result === 'ALREADY_USED'
                      ? '⚠️ ATTENTION : BILLET DÉJÀ SCANNÉ'
                      : '⛔ ACCÈS REFUSÉ'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold border bg-white/70">
                    {lastResult.categoryName}
                  </span>
                </div>
                <div className="mt-1 text-xs space-y-0.5">
                  <p>
                    Festivalier : <strong>{lastResult.holderName}</strong> (Réf: {lastResult.ticketReference})
                  </p>
                  <p className="opacity-80">
                    Opérateur : {lastResult.agentName} · Portique : {lastResult.gate}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono opacity-70">
                {lastResult.scannedAt}
              </span>
            </div>
          )}
        </div>

        {/* Historique Blanc des Passages Scannés */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Journal des passages scannés ({scanLogs.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historique des contrôles de sécurité et horodatage des passages.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Heure</th>
                  <th className="py-3.5 px-4">Réf. Billet</th>
                  <th className="py-3.5 px-4">Festivalier</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Décision</th>
                  <th className="py-3.5 px-4 sm:px-6">Portique / Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scanLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Aucun scan enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  scanLogs.map((log) => {
                    const badge = decisionBadges[log.result] || decisionBadges.INVALID;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-500">
                          {log.scannedAt}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-800">
                          {log.ticketReference}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                          {log.holderName}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {log.categoryName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500">
                          {log.gate} ({log.agentName})
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
