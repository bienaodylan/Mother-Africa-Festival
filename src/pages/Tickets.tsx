/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TICKETS } from '../data.ts';
import { useCart } from '../context/CartContext.tsx';

interface TicketsProps {
  go: (route: string) => void;
}

export const Tickets: React.FC<TicketsProps> = ({ go }) => {
  const { selectCategory } = useCart();

  const handleReserve = (ticketId: string) => {
    selectCategory(ticketId);
    go('/billets/commande');
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 select-none">
      <div>
        {/* Titre BILLETS */}
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none mb-8 sm:mb-12">
          BILLETS
        </h1>

        {/* Grille d'une colonne, deux en lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {TICKETS.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => handleReserve(ticket.id)}
              className="border-[6px] border-[#F4F1EA] bg-[#142B1A]/70 p-6 sm:p-10 flex flex-col justify-between text-left transition-colors duration-150 group hover:bg-[#C85A17] hover:border-[#C85A17] cursor-pointer"
            >
              <div>
                <h2 className="font-display leading-[0.9]">
                  <span className="text-[#F4F1EA] text-5xl sm:text-7xl lg:text-8xl block">
                    [ {ticket.name}
                  </span>
                  <span className="text-[#C85A17] group-hover:text-[#F4F1EA] text-5xl sm:text-7xl lg:text-8xl block mt-1 transition-colors duration-150">
                    {ticket.price} ]
                  </span>
                </h2>

                <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#F4F1EA] mt-4 uppercase">
                  {ticket.perks}
                </p>

                <p className="font-display text-xs sm:text-sm text-[#F4F1EA] mt-2 uppercase tracking-wide">
                  {ticket.note}
                </p>
              </div>

              {/* Bouton [ RÉSERVER ] */}
              <div className="mt-8 pt-4">
                <span className="inline-block px-6 sm:px-8 py-3 border-2 border-[#F4F1EA] font-display text-xl sm:text-2xl text-[#F4F1EA] uppercase tracking-wider bg-transparent group-hover:bg-[#F4F1EA] group-hover:text-[#142B1A] transition-colors">
                  [ RÉSERVER ]
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-12 pb-4 text-xs font-body text-[#F4F1EA]/60 uppercase tracking-widest">
        TARIFS OFFICIELS · MOTHER AFRICA FESTIVAL 2026 · MARCORY ZONE 4
      </div>
    </div>
  );
};
