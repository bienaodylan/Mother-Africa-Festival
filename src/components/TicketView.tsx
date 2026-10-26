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
    <div className="w-full border-4 border-[#F4F1EA] bg-[#0c1c11] text-[#F4F1EA] p-5 sm:p-8 select-none transition-transform duration-200 hover:-translate-y-1">
      {/* 1. Zone Visuelle : Image du ticket ou Cadre Pointillé réglementaire */}
      <div className="mb-6">
        {!imageFailed ? (
          <div className="relative w-full max-h-[220px] overflow-hidden flex items-center justify-center bg-black/40 border border-[#F4F1EA]/20">
            <img
              src={ticketAssetPath}
              alt={`Ticket ${ticket.category}`}
              onError={() => setImageFailed(true)}
              className="w-full h-auto object-contain max-h-[220px]"
            />
          </div>
        ) : (
          /* Si un fichier manque : cadre pointillé marqué « design du ticket à intégrer » (conforme au brief) */
          <div className="w-full py-8 px-4 border-2 border-dashed border-[#F4F1EA]/40 flex flex-col items-center justify-center text-center bg-black/20">
            <span className="font-display text-sm sm:text-lg text-[#F4F1EA]/80 uppercase tracking-widest">
              « DESIGN DU TICKET À INTÉGRER »
            </span>
            <span className="font-body text-xs text-[#C85A17] uppercase mt-1">
              Fichier attendu : src/assets/tickets/{ticket.categoryId}.png
            </span>
          </div>
        )}
      </div>

      {/* 2. Données Dynamiques du Ticket */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t-2 border-[#C85A17] pt-5">
        {/* Colonne Gauche : Données Textuelles */}
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-[#C85A17] text-[#F4F1EA] px-2.5 py-0.5 text-xs font-display tracking-widest uppercase">
              {ticket.category}
            </span>
            <span className="font-display text-xs text-[#F4F1EA]/60 uppercase">
              COMMANDE #{ticket.orderId}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-display uppercase tracking-widest text-[#C85A17] block">
              NOM DU PORTEUR
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-[#F4F1EA] leading-none mt-0.5">
              {ticket.holderName}
            </h3>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-body text-[#F4F1EA]/80 pt-1">
            <div>
              <span className="text-[#C85A17] font-display uppercase block">DATES :</span>
              <span>{FACTS.dates}</span>
            </div>
            <div>
              <span className="text-[#C85A17] font-display uppercase block">LIEU :</span>
              <span>{FACTS.lieu}</span>
            </div>
            <div>
              <span className="text-[#C85A17] font-display uppercase block">TARIF :</span>
              <span className="font-bold text-[#F4F1EA]">{ticket.price}</span>
            </div>
          </div>

          {/* Réf Billet Monospace */}
          <div className="pt-2">
            <span className="text-[11px] font-display uppercase tracking-widest text-[#F4F1EA]/60 block">
              RÉFÉRENCE UNIQUE
            </span>
            <span className="font-mono text-base font-bold text-[#F4F1EA] tracking-wider">
              {ticket.reference}
            </span>
          </div>
        </div>

        {/* Colonne Droite : QR Code */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[#F4F1EA]/20 pt-4 md:pt-0 md:pl-6">
          {qrCodeUrl ? (
            <button
              type="button"
              onClick={() => onShowQr?.(qrCodeUrl, ticket.reference)}
              className="group cursor-pointer text-center focus:outline-none"
              title="Agrandir le QR Code pour le scan"
            >
              <div className="p-2.5 bg-[#F4F1EA] border-2 border-[#142B1A] transition-transform group-hover:scale-105">
                <img
                  src={qrCodeUrl}
                  alt={`QR code ${ticket.reference}`}
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              </div>
              <span className="font-display text-[11px] text-[#C85A17] group-hover:underline block mt-2 uppercase tracking-wider">
                [ AGRANDIR LE QR ]
              </span>
            </button>
          ) : (
            <div className="w-28 h-28 bg-[#F4F1EA]/10 animate-pulse" />
          )}
        </div>
      </div>

      {/* 3. Actions Billet */}
      {(onShowQr || onDownload) && (
        <div className="mt-6 pt-4 border-t border-[#F4F1EA]/20 flex flex-wrap gap-3 justify-end">
          {onShowQr && qrCodeUrl && (
            <button
              type="button"
              onClick={() => onShowQr(qrCodeUrl, ticket.reference)}
              className="brut-btn text-xs sm:text-sm py-2 px-4"
            >
              [ MONTRER LE QR ]
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              onClick={() => onDownload(ticket)}
              className="brut-btn text-xs sm:text-sm py-2 px-4"
            >
              [ TÉLÉCHARGER ]
            </button>
          )}
        </div>
      )}
    </div>
  );
};
