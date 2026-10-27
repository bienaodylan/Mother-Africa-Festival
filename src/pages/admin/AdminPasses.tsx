/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.tsx';
import { passService, FestivalPass, PassStatus, PassDays } from '../../services/passService.ts';
import { formatFCFA } from '../../data.ts';

interface AdminPassesProps {
  go: (route: string) => void;
}

export const AdminPasses: React.FC<AdminPassesProps> = ({ go }) => {
  const [passes, setPasses] = useState<FestivalPass[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPass, setEditingPass] = useState<FestivalPass | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [priceNum, setPriceNum] = useState<number>(10000);
  const [days, setDays] = useState<PassDays>('PASS 2 JOURS');
  const [quotaTotal, setQuotaTotal] = useState<number>(5000);
  const [perks, setPerks] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<PassStatus>('PUBLISHED');

  const reloadPasses = () => {
    setPasses(passService.getAllPasses());
  };

  useEffect(() => {
    reloadPasses();
  }, []);

  const openCreateModal = () => {
    setEditingPass(null);
    setName('');
    setPriceNum(15000);
    setDays('PASS 2 JOURS');
    setQuotaTotal(3000);
    setPerks('PASS 2 JOURS · 27 & 28 DÉCEMBRE');
    setNote('DANS LA LIMITE DES STOCKS DISPONIBLES');
    setStatus('PUBLISHED');
    setIsModalOpen(true);
  };

  const openEditModal = (p: FestivalPass) => {
    setEditingPass(p);
    setName(p.name);
    setPriceNum(p.numericPrice);
    setDays(p.days);
    setQuotaTotal(p.quotaTotal);
    setPerks(p.perks);
    setNote(p.note);
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    passService.savePass({
      id: editingPass?.id,
      name: name.trim().toUpperCase(),
      price: formatFCFA(priceNum),
      numericPrice: Number(priceNum),
      days,
      quotaTotal: Number(quotaTotal),
      quotaSold: editingPass?.quotaSold || 0,
      quotaReserved: editingPass?.quotaReserved || 0,
      perks: perks.trim().toUpperCase(),
      note: note.trim().toUpperCase(),
      status
    });

    setIsModalOpen(false);
    reloadPasses();
  };

  const handleDelete = (id: string, passName: string) => {
    if (window.confirm(`Confirmer la suppression ou l'archivage du pass "${passName}" ?`)) {
      passService.deletePass(id);
      reloadPasses();
    }
  };

  const statusBadges: Record<PassStatus, { label: string; badgeClass: string }> = {
    PUBLISHED: { label: 'En vente', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    DRAFT: { label: 'Brouillon', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' },
    SOLD_OUT: { label: 'Épuisé', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
    SUSPENDED: { label: 'Suspendu', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    ARCHIVED: { label: 'Archivé', badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200' }
  };

  return (
    <AdminLayout currentRoute="/admin/billetterie" go={go}>
      <div className="space-y-6 select-none font-admin">
        {/* Titre & Bouton d'action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Catalogue des Pass & Tarifs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configuration des billets disponibles à la vente pour le Mother Africa Festival 2026.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+</span>
            <span>Nouveau Pass</span>
          </button>
        </div>

        {/* Tableau Blanc Commercial des Pass */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Nom du Pass</th>
                  <th className="py-3.5 px-4">Tarif unitaire</th>
                  <th className="py-3.5 px-4">Jours d'accès</th>
                  <th className="py-3.5 px-4">Quotas & Ventes</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passes.map((p) => {
                  const pct = Math.min(100, Math.round((p.quotaSold / (p.quotaTotal || 1)) * 100));
                  const badge = statusBadges[p.status];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900 text-sm">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {p.perks}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {p.price}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {p.days}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-700">
                          <strong className="text-slate-900">{p.quotaSold.toLocaleString()}</strong> / {p.quotaTotal.toLocaleString()} ({pct}%)
                        </div>
                        <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.status === 'SOLD_OUT' ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de création / modification épurée et blanche */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">
                  {editingPass ? `Modifier le pass ${editingPass.name}` : 'Créer un nouveau pass'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                    Nom du pass
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: GRAND PUBLIC, VIP OR..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                      Tarif (FCFA)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={priceNum}
                      onChange={(e) => setPriceNum(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                      Quota total
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={quotaTotal}
                      onChange={(e) => setQuotaTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                      Jours de validité
                    </label>
                    <select
                      value={days}
                      onChange={(e) => setDays(e.target.value as PassDays)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="PASS 2 JOURS">PASS 2 JOURS</option>
                      <option value="JOUR 1 (27 DÉC)">JOUR 1 (27 DÉC)</option>
                      <option value="JOUR 2 (28 DÉC)">JOUR 2 (28 DÉC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                      Statut billetterie
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as PassStatus)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="PUBLISHED">En vente (Publié)</option>
                      <option value="DRAFT">Brouillon</option>
                      <option value="SOLD_OUT">Épuisé (Sold out)</option>
                      <option value="SUSPENDED">Suspendu</option>
                      <option value="ARCHIVED">Archivé</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                    Avantages & description
                  </label>
                  <input
                    type="text"
                    value={perks}
                    onChange={(e) => setPerks(e.target.value)}
                    placeholder="PASS 2 JOURS · 27 & 28 DÉCEMBRE"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                    Note commerciale
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="DANS LA LIMITE DES STOCKS DISPONIBLES"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
