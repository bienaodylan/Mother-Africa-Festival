/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TicketView } from '../components/TicketView.tsx';
import { PurchasedTicket } from '../data.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface MyTicketsProps {
  go: (route: string) => void;
}

export const MyTickets: React.FC<MyTicketsProps> = ({ go }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeQrModal, setActiveQrModal] = useState<{ url: string; ref: string } | null>(null);

  useEffect(() => {
    if (!user) {
      // Redirection si l'utilisateur n'est pas connecté
      go('/compte/connexion?next=/compte/billets');
      return;
    }

    let isMounted = true;
    api
      .getMyTickets(user.id)
      .then((t) => {
        if (isMounted) {
          setTickets(t);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, go]);

  const handleDownload = (ticket: PurchasedTicket) => {
    alert(`Téléchargement du pass officiel ${ticket.reference} (${ticket.holderName})...\nFormat PDF d'art prêt pour l'impression.`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-8 max-w-5xl mx-auto select-none">
      <div>
        {/* Titre MES BILLETS */}
        <div className="mb-8 sm:mb-12">
          <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
            ESPACE FESTIVALIER · {user ? `${user.firstName} ${user.lastName}` : ''}
          </span>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
            MES BILLETS
          </h1>
        </div>

        {/* État de chargement */}
        {isLoading && (
          <div className="border-4 border-[#F4F1EA] p-8 text-center bg-[#0c1c11]">
            <span className="font-display text-xl text-[#C85A17] animate-pulse">
              CHARGEMENT DE VOS TITRES D'ACCÈS...
            </span>
          </div>
        )}

        {/* Cas : Aucun billet pour l'instant */}
        {!isLoading && tickets.length === 0 && (
          <div className="border-4 border-[#F4F1EA] p-8 sm:p-14 text-center bg-[#0c1c11] space-y-6">
            <h2 className="font-display text-3xl sm:text-5xl text-[#F4F1EA]">
              AUCUN BILLET POUR L'INSTANT
            </h2>
            <p className="font-body text-sm sm:text-base text-[#F4F1EA]/80 max-w-md mx-auto">
              Vous n'avez pas encore réservé de pass pour la 5ème édition de Mother Africa Festival 2026.
            </p>
            <div>
              <button
                type="button"
                onClick={() => go('/billets')}
                className="brut-btn px-8 sm:px-12 py-4 text-xl sm:text-2xl"
              >
                [ ACCÉDER À LA BILLETTERIE ]
              </button>
            </div>
          </div>
        )}

        {/* Cas : Liste des billets */}
        {!isLoading && tickets.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs font-display text-[#F4F1EA]/70 uppercase">
              <span>{tickets.length} TITRE{tickets.length > 1 ? 'S' : ''} D'ACCÈS ACTIF{tickets.length > 1 ? 'S' : ''}</span>
              <span className="text-[#C85A17]">BRACELET RFID REMIS SUR PRÉSENTATION DU QR CODE</span>
            </div>

            <div className="space-y-8">
              {tickets.map((ticket) => (
                <TicketView
                  key={ticket.reference}
                  ticket={ticket}
                  onShowQr={(url, ref) => setActiveQrModal({ url, ref })}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        )}
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
