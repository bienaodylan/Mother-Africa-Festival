/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.tsx';
import { adminService } from '../../services/adminService.ts';
import { Order, PurchasedTicket, formatFCFA } from '../../data.ts';

interface AdminOrdersProps {
  go: (route: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ go }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    setOrders(adminService.getOrders(search));
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleRefund = (orderId: string) => {
    if (!refundReason.trim()) {
      alert('Veuillez indiquer un motif de remboursement pour la traçabilité comptable.');
      return;
    }
    const success = adminService.refundOrder(orderId, refundReason);
    if (success) {
      setActionSuccessMsg(`La commande #${orderId} a été annulée et remboursée avec succès.`);
      setSelectedOrder(null);
      setRefundReason('');
      loadData();
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  return (
    <AdminLayout currentRoute="/admin/commandes" go={go}>
      <div className="space-y-6 select-none font-admin">
        {/* Titre & Recherche */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Commandes festivaliers
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Historique des transactions, paniers confirmés et gestion des remboursements.
            </p>
          </div>

          {/* Champ de recherche commercial */}
          <div className="w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, réf..."
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Message de succès */}
        {actionSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
            <span>✓</span>
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Tableau Blanc Commercial des Commandes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Réf. Commande</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Pass & Catégorie</th>
                  <th className="py-3.5 px-4">Quantité</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Paiement</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      Aucune commande trouvée correspondant à votre recherche.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-mono text-xs font-medium text-slate-700">
                        #{o.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {o.userName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {o.userEmail}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-800">
                        {o.categoryName}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700">
                        {o.quantity} {o.quantity > 1 ? 'billets' : 'billet'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-xs sm:text-sm text-slate-900">
                        {formatFCFA(o.totalPrice)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {o.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de détail et remboursement épurée et blanche */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Détail de la commande #{selectedOrder.id}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Client : {selectedOrder.userName} ({selectedOrder.userEmail})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Catégorie réservée :</span>
                    <strong className="text-slate-900">{selectedOrder.categoryName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nombre de pass :</span>
                    <strong className="text-slate-900">{selectedOrder.quantity}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tarif unitaire :</span>
                    <span className="text-slate-700">{formatFCFA(selectedOrder.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                    <span className="text-slate-900">Montant total réglé :</span>
                    <span className="text-emerald-700">{formatFCFA(selectedOrder.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Canal de règlement :</span>
                    <span className="text-slate-700">{selectedOrder.paymentMethod.toUpperCase()}</span>
                  </div>
                </div>

                {/* Billets individuels associés */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">
                    Billets émis ({selectedOrder.tickets?.length || 0})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedOrder.tickets?.map((t: PurchasedTicket) => (
                      <div
                        key={t.reference}
                        className="p-2.5 bg-white border border-slate-200 rounded-md flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900">{t.reference}</span>
                          <span className="text-slate-500 block text-[11px]">{t.holderName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Valide
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zone de remboursement */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                    Motif en cas de remboursement :
                  </label>
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Ex: Erreur de saisie client, annulation..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleRefund(selectedOrder.id)}
                  className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-medium hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  Effectuer un remboursement
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
