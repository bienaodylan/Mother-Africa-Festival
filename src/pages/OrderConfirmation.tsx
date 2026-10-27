/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { PurchasedTicket, Order, FACTS } from '../data.ts';
import { useAuth } from '../context/AuthContext.tsx';
import TicketTemplate from '../components/TicketTemplate.tsx';
import { ticketPdfService } from '../services/ticketPdfService.ts';
import { DigitalTicket } from '../types/ticket.ts';

interface OrderConfirmationProps {
  go: (route: string) => void;
  orderId?: string;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ go, orderId }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [activeQrModal, setActiveQrModal] = useState<{ url: string; ref: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('maf_orders_v1');
      if (raw) {
        const orders: Order[] = JSON.parse(raw);
        const targetOrder = orderId ? orders.find((o) => o.id === orderId) : orders[0];
        if (targetOrder) {
          setOrder(targetOrder);
          setTickets(targetOrder.tickets);

          // Génération des QR codes pour chaque billet
          targetOrder.tickets.forEach(async (t: PurchasedTicket) => {
            try {
              const url = await QRCode.toDataURL(`MAF26://${t.reference}:${targetOrder.id}`, {
                width: 280,
                margin: 1,
                color: {
                  dark: '#0D1E13',
                  light: '#FFFFFF'
                }
              });
              setQrCodeUrls((prev) => ({ ...prev, [t.reference]: url }));
            } catch {
              // noop
            }
          });
        }
      }
    } catch (err) {
      console.error('Erreur chargement commande', err);
    }
  }, [orderId]);

  const handleDownloadPdf = (ticket: PurchasedTicket, index: number) => {
    const digitalTicket: DigitalTicket = {
      id: `tkt_${ticket.reference}`,
      reference: ticket.reference,
      orderId: order?.id || 'ORD-2026',
      ticketNumber: `N° ${String(index + 1).padStart(4, '0')}`,
      categoryId: ticket.categoryId,
      categoryName: ticket.category,
      holderName: ticket.holderName,
      price: ticket.price,
      numericPrice: ticket.numericPrice,
      status: 'CONFIRMED',
      secureToken: `maf26_sec_${ticket.reference}`,
      purchaseDate: ticket.purchaseDate,
      eventDates: ticket.eventDates || FACTS.dates,
      location: ticket.location || `${FACTS.lieu}, ABIDJAN`,
      gateInfo:
        ticket.categoryId === 'vip-debout'
          ? 'PORTE VIP NORD - ESPACE SCÈNE PRIVILÈGE'
          : 'PORTE SUD - ENTRÉE PRINCIPALE',
      doorOpeningTime: ticket.categoryId === 'vip-debout' ? '15:30 GMT' : '16:00 GMT'
    };

    ticketPdfService.downloadTicketPdf(digitalTicket);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-8 max-w-5xl mx-auto select-none">
      <div>
        {/* Titre géant : C'EST FAIT. */}
        <div className="mb-8 sm:mb-12">
          <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
            COMMANDE CONFIRMÉE {order ? `· #${order.id}` : ''}
          </span>
          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl text-[#F4F1EA] leading-none">
            C'EST FAIT.
          </h1>
          <p className="font-body text-sm sm:text-lg text-[#F4F1EA]/90 mt-3 max-w-2xl leading-relaxed">
            Vos billets officiels ont été générés avec succès et transmis à{' '}
            <strong className="text-[#C85A17]">
              {user?.email || order?.userEmail || 'votre adresse email'}
            </strong>
            .
          </p>
        </div>

        {/* AFFICHAGE DIRECT DU TEMPLATE OFFICIEL DU BILLET SUR LA PAGE DE CONFIRMATION */}
        <div className="space-y-12 sm:space-y-16">
          {tickets.map((ticket, index) => {
            const ticketNum = `N° ${String(index + 1).padStart(4, '0')}`;
            const qrUrl = qrCodeUrls[ticket.reference] || '';

            return (
              <div key={ticket.reference} className="w-full">
                {/* 1. Le Ticket Template sans arrière-plan blanc */}
                <TicketTemplate
                  category={ticket.category}
                  ticketNumber={ticketNum}
                  buyerName={ticket.holderName}
                  artistName="DAVIDO"
                  artistSubtitle="& GUESTS"
                  artistImage="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
                  qrCodeUrl={qrUrl}
                  eventDates={ticket.eventDates || FACTS.dates}
                  location={ticket.location || 'MARCORY ZONE 4'}
                  price={ticket.price}
                  statusText="✓ CONFIRMÉ - VALIDE"
                  statusColor="text-[#22c55e]"
                  onShowQr={() => setActiveQrModal({ url: qrUrl, ref: ticket.reference })}
                />

                {/* 2. Boutons d'action placés directement sous le ticket */}
                <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 mt-4 w-full">
                  <button
                    type="button"
                    onClick={() => go(`/compte/mes-billets/${ticket.reference}`)}
                    className="brut-btn py-3 px-6 sm:py-3.5 sm:px-8 text-sm sm:text-base"
                  >
                    [ VOIR MON BILLET ]
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(ticket, index)}
                    className="py-3 px-6 sm:py-3.5 sm:px-8 border-2 border-[#F4F1EA] font-display text-sm sm:text-base text-[#F4F1EA] hover:border-[#C85A17] hover:text-[#C85A17] hover:bg-[#C85A17]/10 transition-colors uppercase cursor-pointer flex items-center gap-2"
                  >
                    <span>↓</span>
                    <span>[ TÉLÉCHARGER LE PDF ]</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton Voir mes Billets & Retour */}
        <div className="mt-14 pt-8 border-t-2 border-[#F4F1EA]/25 flex flex-col sm:flex-row items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => go('/compte/mes-billets')}
            className="w-full sm:w-auto brut-btn px-10 sm:px-14 py-4 text-xl sm:text-2xl"
          >
            [ ACCÉDER À MES BILLETS ]
          </button>

          <button
            type="button"
            onClick={() => go('/')}
            className="font-display text-base text-[#F4F1EA]/70 hover:text-[#C85A17] uppercase"
          >
            RETOURNER À L'ACCUEIL →
          </button>
        </div>
      </div>

      {/* Modal QR Code Plein Écran */}
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
            className="bg-[#0D1E13] text-[#F4F1EA] border-4 border-[#C85A17] p-8 sm:p-10 text-center max-w-sm w-full shadow-[10px_10px_0px_#C85A17]"
          >
            <span className="font-display text-xs tracking-widest text-[#C85A17] uppercase block mb-2 font-bold">
              SCAN ENTRÉE FESTIVAL 2026
            </span>
            <div className="p-3 bg-white border-2 border-[#142B1A] inline-block mb-3 shadow-md rounded-lg">
              <img
                src={activeQrModal.url}
                alt="QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            </div>
            <div className="font-mono font-bold text-lg text-[#F4F1EA] tracking-wider mb-6">
              #{activeQrModal.ref}
            </div>
            <button
              type="button"
              onClick={() => setActiveQrModal(null)}
              className="w-full py-3 bg-[#C85A17] text-[#F4F1EA] font-display text-base uppercase hover:bg-[#F4F1EA] hover:text-[#142B1A] transition-colors cursor-pointer"
            >
              [ FERMER ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
