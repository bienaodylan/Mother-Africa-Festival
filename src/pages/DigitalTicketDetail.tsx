/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DigitalTicket } from '../types/ticket.ts';
import { ticketService, generateSecureQrPayload } from '../services/ticketService.ts';
import { FACTS } from '../data.ts';
import TicketTemplate from '../components/TicketTemplate.tsx';
import { ticketPdfService } from '../services/ticketPdfService.ts';

interface DigitalTicketDetailProps {
  ticketRef: string;
  go: (route: string) => void;
}

export const DigitalTicketDetail: React.FC<DigitalTicketDetailProps> = ({ ticketRef, go }) => {
  const [ticket, setTicket] = useState<DigitalTicket | null>(null);
  const [relatedTickets, setRelatedTickets] = useState<DigitalTicket[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeQrModal, setActiveQrModal] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    ticketService
      .getTicketByReference(ticketRef)
      .then(async (t) => {
        if (!isMounted) return;
        if (t) {
          setTicket(t);

          // Génération du QR Code sécurisé
          const payload = generateSecureQrPayload(t);
          const qrUrl = await QRCode.toDataURL(payload, {
            width: 320,
            margin: 1,
            color: {
              dark: '#0D1E13',
              light: '#FFFFFF'
            }
          });
          if (isMounted) setQrCodeDataUrl(qrUrl);

          // Récupération des autres billets de la même commande
          const related = await ticketService.getRelatedTicketsInOrder(t.orderId);
          if (isMounted) setRelatedTickets(related.length > 1 ? related : []);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ticketRef]);

  const currentIndex = relatedTickets.findIndex((t) => t.reference === ticket?.reference);

  const handleDownloadPdf = async () => {
    if (!ticket) return;
    setIsDownloading(true);
    try {
      await ticketPdfService.downloadTicketPdf(ticket);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-8 select-none">
        <div className="border-4 border-[#F4F1EA] p-12 text-center bg-[#0c1c11] max-w-md w-full">
          <span className="font-display text-2xl text-[#C85A17] animate-pulse">
            CHARGEMENT DU BILLET NUMÉRIQUE...
          </span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-8 text-center select-none max-w-xl mx-auto">
        <div className="border-4 border-[#C85A17] p-10 bg-[#0c1c11] space-y-6 w-full">
          <h1 className="font-display text-4xl text-[#F4F1EA]">BILLET INTROUVABLE</h1>
          <p className="font-body text-sm text-[#F4F1EA]/80">
            Aucun billet officiel ne correspond à la référence « {ticketRef} ».
          </p>
          <button
            type="button"
            onClick={() => go('/compte/mes-billets')}
            className="brut-btn py-4 px-8 text-xl"
          >
            [ RETOUR À MES BILLETS ]
          </button>
        </div>
      </div>
    );
  }

  const isConfirmed = ticket.status === 'CONFIRMED';

  return (
    <div className="w-full min-h-[calc(100vh-140px)] px-4 sm:px-8 lg:px-12 py-8 max-w-5xl mx-auto select-none pb-24">
      {/* Barre supérieure : retour et pagination des billets associés */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-[#F4F1EA]/25">
        <button
          type="button"
          onClick={() => go('/compte/mes-billets')}
          className="font-display text-base sm:text-lg text-[#F4F1EA] hover:text-[#C85A17] transition-colors uppercase cursor-pointer flex items-center gap-2"
        >
          ← [ RETOUR À MES BILLETS ]
        </button>

        {relatedTickets.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-wider uppercase">
              BILLET {currentIndex + 1} SUR {relatedTickets.length} :
            </span>
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => go(`/compte/mes-billets/${relatedTickets[currentIndex - 1].reference}`)}
                  className="px-3 py-1 border-2 border-[#F4F1EA] font-display text-xs text-[#F4F1EA] hover:bg-[#C85A17] hover:border-[#C85A17] transition-colors uppercase"
                >
                  ← PRÉCÉDENT
                </button>
              )}
              {currentIndex < relatedTickets.length - 1 && (
                <button
                  type="button"
                  onClick={() => go(`/compte/mes-billets/${relatedTickets[currentIndex + 1].reference}`)}
                  className="px-3 py-1 border-2 border-[#F4F1EA] font-display text-xs text-[#F4F1EA] hover:bg-[#C85A17] hover:border-[#C85A17] transition-colors uppercase"
                >
                  SUIVANT →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TITRE ET INFORMATIONS D'ACCÈS */}
      <div className="mb-6">
        <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
          TITRE D'ACCÈS OFFICIEL · #{ticket.reference}
        </span>
        <h1 className="font-display text-4xl sm:text-6xl text-[#F4F1EA] leading-tight">
          VOTRE BILLET PANORAMIQUE
        </h1>
      </div>

      {/* BILLET PANORAMIQUE UNIQUE (SANS AUCUN ARRIÈRE-PLAN BLANC ET SANS DOUBLON) */}
      <div className="w-full mb-8">
        <TicketTemplate
          category={ticket.categoryName}
          ticketNumber={ticket.ticketNumber}
          buyerName={ticket.holderName}
          artistName="DAVIDO"
          artistSubtitle="& GUESTS"
          artistImage="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
          qrCodeUrl={qrCodeDataUrl}
          eventDates={ticket.eventDates}
          location={ticket.location}
          price={ticket.price}
          statusText={isConfirmed ? '✓ CONFIRMÉ - VALIDE' : 'UTILISÉ - EXPIRÉ'}
          statusColor={isConfirmed ? 'text-[#22c55e]' : 'text-zinc-400'}
          onShowQr={() => setActiveQrModal(true)}
        />
      </div>

      {/* BLOC ACTIONS BRUTALISTE SOUS LE TICKET */}
      <div className="flex flex-wrap items-center justify-end gap-4 mb-10 pb-8 border-b-2 border-[#F4F1EA]/25">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="brut-btn py-4 px-8 sm:px-10 text-base sm:text-xl flex items-center gap-2 cursor-pointer"
        >
          <span>↓</span>
          <span>
            {isDownloading ? '[ GÉNÉRATION DU PDF... ]' : '[ TÉLÉCHARGER LE BILLET PDF ]'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQrModal(true)}
          className="py-4 px-6 sm:px-8 border-2 border-[#F4F1EA] font-display text-base sm:text-xl text-[#F4F1EA] hover:border-[#C85A17] hover:text-[#C85A17] hover:bg-[#C85A17]/10 transition-colors uppercase cursor-pointer"
        >
          [ SCAN PLEIN ÉCRAN ]
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="py-4 px-6 sm:px-8 border-2 border-[#F4F1EA]/50 font-display text-base sm:text-xl text-[#F4F1EA]/70 hover:text-[#F4F1EA] hover:border-[#F4F1EA] transition-colors uppercase cursor-pointer"
        >
          [ IMPRIMER ]
        </button>
      </div>

      {/* INFORMATIONS PRATIQUES POUR LE JOUR J */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c1c11] border-4 border-[#F4F1EA] p-6 sm:p-8">
        <div>
          <span className="font-display text-xs text-[#C85A17] uppercase tracking-wider block mb-1">
            CONTRÔLE D'ACCÈS & SÉCURITÉ
          </span>
          <h3 className="font-display text-2xl text-[#F4F1EA] mb-3">
            CONSIGNES FESTIVALIER
          </h3>
          <ul className="space-y-2 font-body text-xs sm:text-sm text-[#F4F1EA]/80 list-disc list-inside">
            <li>Billet nominal strictement personnel : pièce d'identité originale obligatoire.</li>
            <li>Chaque QR code ne peut être validé qu'une seule fois aux portiques.</li>
            <li>Toute tentative de double entrée déclenche une alerte immédiate aux équipes de sécurité.</li>
            <li>Pour le contrôle sur smartphone, réglez la luminosité de votre écran à 100%.</li>
          </ul>
        </div>

        <div>
          <span className="font-display text-xs text-[#C85A17] uppercase tracking-wider block mb-1">
            LOCALISATION & HORAIRES
          </span>
          <h3 className="font-display text-2xl text-[#F4F1EA] mb-3">
            ACCÈS AU SITE
          </h3>
          <div className="space-y-2 font-mono text-xs sm:text-sm text-[#F4F1EA]/90">
            <p>• LIEU : {FACTS.lieu}, {FACTS.ville}</p>
            <p>• ACCÈS PORTIQUE : {ticket.gateInfo}</p>
            <p>• OUVERTURE DES PORTES : {ticket.doorOpeningTime}</p>
            <p>• DATES : {ticket.eventDates}</p>
          </div>
        </div>
      </div>

      {/* Modal QR Code Plein Écran */}
      {activeQrModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR Code Agrandir"
          onClick={() => setActiveQrModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D1E13] text-[#F4F1EA] border-4 border-[#C85A17] p-8 sm:p-12 text-center max-w-sm w-full shadow-[10px_10px_0px_#C85A17]"
          >
            <span className="font-display text-xs tracking-widest text-[#C85A17] uppercase block mb-2 font-bold">
              CONTRÔLE SCAN ENTRÉE
            </span>
            <div className="p-3 bg-white border-2 border-[#142B1A] inline-block mb-4 shadow-md rounded-lg">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code ${ticket.reference}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
              ) : (
                <div className="w-56 h-56 bg-zinc-200 animate-pulse" />
              )}
            </div>
            <div className="font-mono font-bold text-lg text-[#F4F1EA] tracking-wider mb-6">
              #{ticket.reference}
            </div>
            <button
              type="button"
              onClick={() => setActiveQrModal(false)}
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
