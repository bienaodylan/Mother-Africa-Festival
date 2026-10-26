/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TicketView } from '../components/TicketView.tsx';
import { PurchasedTicket, Order } from '../data.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface OrderConfirmationProps {
  go: (route: string) => void;
  orderId?: string;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ go, orderId }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<{ url: string; ref: string } | null>(null);

  useEffect(() => {
    // Récupérer la dernière commande depuis le localStorage
    try {
      const raw = localStorage.getItem('maf_orders_v1');
      if (raw) {
        const orders: Order[] = JSON.parse(raw);
        const targetOrder = orderId ? orders.find((o) => o.id === orderId) : orders[0];
        if (targetOrder) {
          setOrder(targetOrder);
          setTickets(targetOrder.tickets);
        }
      }
    } catch (err) {
      console.error('Erreur chargement commande', err);
    }
  }, [orderId]);

  const handleDownload = (ticket: PurchasedTicket) => {
    // Simulation de téléchargement du billet
    alert(`Téléchargement du billet ${ticket.reference} (${ticket.holderName})...\nFormat PDF d'art prêt pour l'impression.`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-8 max-w-5xl mx-auto select-none">
      <div>
        {/* Titre géant : C'EST FAIT. */}
        <div className="mb-10 sm:mb-12">
          <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
            COMMANDE CONFIRMÉE · {order ? `#${order.id}` : ''}
          </span>
          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl text-[#F4F1EA] leading-none">
            C'EST FAIT.
          </h1>
          <p className="font-body text-base sm:text-xl text-[#F4F1EA]/90 mt-4 max-w-2xl leading-relaxed">
            Vos billets ont aussi été envoyés par email à{' '}
            <strong className="text-[#C85A17]">{user?.email || order?.userEmail || 'votre adresse email'}</strong>.
          </p>
        </div>

        {/* Animation à la confirmation : billets en cascade avec rotation qui se redresse */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="space-y-8"
        >
          {tickets.map((ticket) => (
            <motion.div
              key={ticket.reference}
              variants={{
                hidden: { opacity: 0, y: 50, rotate: -3 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                  transition: {
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1]
                  }
                }
              }}
            >
              <TicketView
                ticket={ticket}
                onShowQr={(url, ref) => setActiveQrModal({ url, ref })}
                onDownload={handleDownload}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bouton Voir mes Billets */}
        <div className="mt-12 pt-8 border-t-2 border-[#F4F1EA]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go('/compte/billets')}
            className="w-full sm:w-auto brut-btn px-8 sm:px-12 py-4 text-xl sm:text-2xl"
          >
            [ VOIR MES BILLETS ]
          </button>

          <button
            type="button"
            onClick={() => go('/')}
            className="font-display text-sm text-[#F4F1EA]/70 hover:text-[#C85A17] uppercase"
          >
            RETOURNER À L'ACCUEIL →
          </button>
        </div>
      </div>

      {/* Modal QR Code plein écran sur fond crème */}
      {activeQrModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR Code Agrandir"
          onClick={() => setActiveQrModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F4F1EA] text-[#142B1A] border-4 border-[#C85A17] p-8 sm:p-12 text-center max-w-sm w-full shadow-[10px_10px_0px_#C85A17]"
          >
            <span className="font-display text-xs tracking-widest text-[#C85A17] uppercase block mb-2">
              SCAN ENTRÉE FESTIVAL
            </span>
            <div className="p-4 bg-white border-2 border-[#142B1A] inline-block mb-4">
              <img
                src={activeQrModal.url}
                alt="QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            </div>
            <div className="font-mono font-bold text-lg text-[#142B1A] tracking-wider mb-6">
              {activeQrModal.ref}
            </div>
            <button
              type="button"
              onClick={() => setActiveQrModal(null)}
              className="w-full py-3 bg-[#142B1A] text-[#F4F1EA] font-display text-base uppercase hover:bg-[#C85A17] transition-colors cursor-pointer"
            >
              [ FERMER ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
