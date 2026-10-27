/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DigitalTicket } from '../types/ticket.ts';
import { ticketService } from '../services/ticketService.ts';
import { PanoramicTicket } from '../components/PanoramicTicket.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ticketPdfService } from '../services/ticketPdfService.ts';

interface MyTicketsProps {
  go: (route: string) => void;
}

export const MyTickets: React.FC<MyTicketsProps> = ({ go }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<DigitalTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeQrModal, setActiveQrModal] = useState<{ url: string; ref: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    ticketService
      .getMyTickets(user?.id)
      .then((data) => {
        if (isMounted) {
          setTickets(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDownload = async (ticket: DigitalTicket) => {
    await ticketPdfService.downloadTicketPdf(ticket);
  };

  const handleViewDetail = (ticket: DigitalTicket) => {
    go(`/compte/mes-billets/${ticket.reference}`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-8 max-w-6xl mx-auto select-none pb-28">
      <div>
        {/* Titre & Sous-titre officiel de la Page */}
        <div className="mb-10 sm:mb-12">
          <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
            ESPACE PERSONNEL · {user ? `${user.firstName} ${user.lastName}` : 'FESTIVALIER'}
          </span>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
            MES BILLETS
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/70 mt-2 uppercase tracking-wide">
            DÉFILEMENT VERTICAL · PASS OFFICIELS POUR LES 27 & 28 DÉCEMBRE 2026
          </p>
        </div>

        {/* État 1 : Chargement */}
        {isLoading && (
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="w-full aspect-[2.83/1] max-w-5xl mx-auto border-4 border-[#F4F1EA]/30 bg-[#0c1c11]/60 animate-pulse p-8 flex items-center justify-center"
              >
                <span className="font-display text-xl sm:text-2xl text-[#C85A17]">
                  CHARGEMENT DU TITRE D'ACCÈS 0{i}...
                </span>
              </div>
            ))}
          </div>
        )}

        {/* État 2 : Aucun billet */}
        {!isLoading && tickets.length === 0 && (
          <div className="border-4 border-[#F4F1EA] p-10 sm:p-16 text-center bg-[#0c1c11] space-y-6 max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-5xl text-[#F4F1EA]">
              AUCUN BILLET ASSOCIÉ À CE COMPTE
            </h2>
            <p className="font-body text-sm sm:text-base text-[#F4F1EA]/80 max-w-md mx-auto">
              Vous n'avez pas encore réservé de pass officiel pour la 5ème édition de Mother Africa Festival 2026.
            </p>
            <div>
              <button
                type="button"
                onClick={() => go('/billets')}
                className="brut-btn px-8 sm:px-12 py-4 text-xl sm:text-2xl"
              >
                [ ACHETER DES BILLETS ]
              </button>
            </div>
          </div>
        )}

        {/* État 3 : Liste des Ensembles (Ticket Panoramique + Boutons d'Action)
            RÈGLE D'AFFICHAGE VERTICAL :
            Les ensembles s'empilent verticalement avec un grand espacement (gap-12).
            Au chargement, on voit les deux premiers ensembles complets, et le haut du 3ème
            ticket coupé par le bas de l'écran pour inciter intuitivement au scroll. */}
        {!isLoading && tickets.length > 0 && (
          <div className="flex flex-col space-y-12 sm:space-y-16">
            {tickets.map((ticket) => (
              <div key={ticket.reference} className="w-full">
                <PanoramicTicket
                  ticket={ticket}
                  onShowQr={(url, ref) => setActiveQrModal({ url, ref })}
                  onDownload={handleDownload}
                  onViewDetail={handleViewDetail}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal QR Code Plein Écran pour le Contrôle */}
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
            <span className="font-display text-xs tracking-widest text-[#C85A17] uppercase block mb-2 font-bold">
              CONTRÔLE SCAN ENTRÉE
            </span>
            <div className="p-4 bg-white border-2 border-[#142B1A] inline-block mb-4 shadow-md">
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
              [ FERMER LE SCAN ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
