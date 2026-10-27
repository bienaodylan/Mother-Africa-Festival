/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { PurchasedTicket, FACTS } from '../data.ts';

interface TicketViewProps {
  ticket: PurchasedTicket;
  onShowQr?: (qrDataUrl: string, reference: string) => void;
  onDownload?: (ticket: PurchasedTicket) => void;
}

export const TicketView: React.FC<TicketViewProps> = ({ ticket, onShowQr, onDownload }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  // Génération du vrai QR Code côté client à partir de la référence MAF26-XXXXXX
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(ticket.reference, {
      width: 220,
      margin: 1,
      color: {
        dark: '#142B1A',
        light: '#F4F1EA'
      }
    })
      .then((url) => {
        if (isMounted) setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Erreur de génération QR Code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [ticket.reference]);

  // Fichier d'image fourni attendu dans src/assets/tickets/
  const ticketAssetPath = `/src/assets/tickets/${ticket.categoryId}.png`;

  return (
    <div className="w-full border-4 border-[#F4F1EA] bg-black/70 backdrop-blur-md text-[#F4F1EA] p-6 sm:p-10 select-none transition-transform duration-200 hover:-translate-y-1 shadow-2xl">
      {/* 1. Zone Visuelle : Image du ticket ou Cadre Pointillé réglementaire */}
      <div className="mb-8">
        {!imageFailed ? (
          <div className="relative w-full max-h-[260px] overflow-hidden flex items-center justify-center bg-black/50 border-2 border-[#F4F1EA]/30">
            <img
              src={ticketAssetPath}
              alt={`Ticket ${ticket.category}`}
              onError={() => setImageFailed(true)}
              className="w-full h-auto object-contain max-h-[260px]"
            />
          </div>
        ) : (
          /* Si un fichier manque : cadre pointillé marqué « design du ticket à intégrer » (conforme au brief) */
          <div className="w-full py-12 px-6 border-4 border-dashed border-[#F4F1EA]/40 flex flex-col items-center justify-center text-center bg-black/40">
            <span className="font-display text-xl sm:text-2xl text-[#F4F1EA] uppercase tracking-widest text-shadow-strong">
              « DESIGN DU TICKET À INTÉGRER »
            </span>
            <span className="font-body text-sm sm:text-base text-[#C85A17] uppercase mt-2 font-bold tracking-wider">
              Fichier attendu : src/assets/tickets/{ticket.categoryId}.png
            </span>
          </div>
        )}
      </div>

      {/* 2. Données Dynamiques du Ticket */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t-4 border-[#C85A17] pt-8">
        {/* Colonne Gauche : Données Textuelles */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="bg-[#C85A17] text-[#F4F1EA] px-4 py-1.5 text-base sm:text-xl font-display tracking-widest uppercase">
              {ticket.category}
            </span>
            <span className="font-display text-base sm:text-xl text-[#F4F1EA] tracking-wider uppercase border border-[#F4F1EA]/40 px-3 py-1 bg-black/40">
              COMMANDE #{ticket.orderId}
            </span>
          </div>

          <div>
            <span className="text-base sm:text-lg font-display uppercase tracking-widest text-[#C85A17] block mb-1">
              NOM DU PORTEUR
            </span>
            <h3 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#F4F1EA] leading-tight text-shadow-strong">
              {ticket.holderName}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-black/40 p-3 border border-[#F4F1EA]/20">
              <span className="text-[#C85A17] font-display text-sm sm:text-base uppercase block mb-0.5">DATES :</span>
              <span className="font-display text-lg sm:text-xl text-[#F4F1EA] block">{FACTS.dates}</span>
            </div>
            <div className="bg-black/40 p-3 border border-[#F4F1EA]/20">
              <span className="text-[#C85A17] font-display text-sm sm:text-base uppercase block mb-0.5">LIEU :</span>
              <span className="font-display text-lg sm:text-xl text-[#F4F1EA] block">{FACTS.lieu}</span>
            </div>
            <div className="bg-black/40 p-3 border border-[#F4F1EA]/20">
              <span className="text-[#C85A17] font-display text-sm sm:text-base uppercase block mb-0.5">TARIF :</span>
              <span className="font-display text-lg sm:text-xl text-[#F4F1EA] block">{ticket.price}</span>
            </div>
          </div>

          {/* Réf Billet Monospace */}
          <div className="pt-2">
            <span className="text-base sm:text-lg font-display uppercase tracking-widest text-[#C85A17] block mb-1">
              RÉFÉRENCE UNIQUE DU TITRE D'ACCÈS
            </span>
            <span className="font-mono text-xl sm:text-3xl font-bold text-[#F4F1EA] tracking-widest bg-black/60 px-4 py-2 border-2 border-[#F4F1EA]/30 inline-block text-shadow-strong">
              {ticket.reference}
            </span>
          </div>
        </div>

        {/* Colonne Droite : QR Code */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l-2 border-[#F4F1EA]/30 pt-6 md:pt-0 md:pl-8">
          {qrCodeUrl ? (
            <button
              type="button"
              onClick={() => onShowQr?.(qrCodeUrl, ticket.reference)}
              className="group cursor-pointer text-center focus:outline-none"
              title="Agrandir le QR Code pour le scan"
            >
              <div className="p-3 bg-[#F4F1EA] border-4 border-[#142B1A] transition-transform group-hover:scale-105 shadow-xl">
                <img
                  src={qrCodeUrl}
                  alt={`QR code ${ticket.reference}`}
                  className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                />
              </div>
              <span className="font-display text-base sm:text-lg text-[#C85A17] group-hover:underline block mt-3 uppercase tracking-wider">
                [ AGRANDIR LE QR ]
              </span>
            </button>
          ) : (
            <div className="w-36 h-36 bg-[#F4F1EA]/10 animate-pulse" />
          )}
        </div>
      </div>

      {/* 3. Actions Billet */}
      {(onShowQr || onDownload) && (
        <div className="mt-8 pt-6 border-t-2 border-[#F4F1EA]/20 flex flex-wrap gap-4 justify-end">
          {onShowQr && qrCodeUrl && (
            <button
              type="button"
              onClick={() => onShowQr(qrCodeUrl, ticket.reference)}
              className="brut-btn text-base sm:text-lg py-3 px-6"
            >
              [ MONTRER LE QR ]
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              onClick={() => onDownload(ticket)}
              className="brut-btn text-base sm:text-lg py-3 px-6"
            >
              [ TÉLÉCHARGER ]
            </button>
          )}
        </div>
      )}
    </div>
  );
};
