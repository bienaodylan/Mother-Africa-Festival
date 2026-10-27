/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DigitalTicket } from '../types/ticket.ts';
import { generateSecureQrPayload } from '../services/ticketService.ts';
import TicketTemplate from './TicketTemplate.tsx';
import { ticketPdfService } from '../services/ticketPdfService.ts';

interface PanoramicTicketProps {
  ticket: DigitalTicket;
  onShowQr: (url: string, ref: string) => void;
  onViewDetail: (ticket: DigitalTicket) => void;
  onDownload?: (ticket: DigitalTicket) => void;
}

export const PanoramicTicket: React.FC<PanoramicTicketProps> = ({
  ticket,
  onShowQr,
  onViewDetail
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const payload = generateSecureQrPayload(ticket);

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0D1E13',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch((err) => console.error('Erreur QR Code', err));

    return () => {
      isMounted = false;
    };
  }, [ticket]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await ticketPdfService.downloadTicketPdf(ticket);
    } finally {
      setIsDownloading(false);
    }
  };

  const isConfirmed = ticket.status === 'CONFIRMED';
  const isUsed = ticket.status === 'USED';

  const statusText = isConfirmed
    ? '✓ CONFIRMÉ - VALIDE'
    : isUsed
    ? 'UTILISÉ - EXPIRÉ'
    : 'ANNULÉ';

  const statusColor = isConfirmed
    ? 'text-[#22c55e]'
    : isUsed
    ? 'text-zinc-400 line-through'
    : 'text-red-500';

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      {/* 1. LE BLOC TICKET (DESIGN PANORAMIQUE SANS ARRIÈRE-PLAN BLANC, AUCUN BOUTON D'ACTION À L'INTÉRIEUR) */}
      <TicketTemplate
        category={ticket.categoryName}
        ticketNumber={ticket.ticketNumber}
        buyerName={ticket.holderName}
        artistName="DAVIDO"
        artistSubtitle="& GUESTS"
        artistImage="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
        qrCodeUrl={qrUrl}
        eventDates={ticket.eventDates}
        location={ticket.location}
        price={ticket.price}
        statusText={statusText}
        statusColor={statusColor}
        onShowQr={() => onShowQr(qrUrl, ticket.reference)}
      />

      {/* 2. LE BLOC D'ACTIONS (SOUS LE TICKET, AVEC ESPACEMENT ET STYLE BRUTALISTE) */}
      <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 mt-4 w-full">
        <button
          type="button"
          onClick={() => onViewDetail(ticket)}
          className="brut-btn py-3 px-6 sm:py-3.5 sm:px-8 text-sm sm:text-base cursor-pointer"
        >
          [ VOIR MON BILLET ]
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="py-3 px-6 sm:py-3.5 sm:px-8 border-2 border-[#F4F1EA] font-display text-sm sm:text-base text-[#F4F1EA] hover:border-[#C85A17] hover:text-[#C85A17] hover:bg-[#C85A17]/10 transition-colors uppercase cursor-pointer flex items-center gap-2"
        >
          <span>↓</span>
          <span>{isDownloading ? '[ CRÉATION PDF... ]' : '[ TÉLÉCHARGER ]'}</span>
        </button>
      </div>
    </div>
  );
};
