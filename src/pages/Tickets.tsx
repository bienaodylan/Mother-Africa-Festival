/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { passService, FestivalPass } from '../services/passService.ts';

interface TicketsProps {
  go: (route: string) => void;
}

export const Tickets: React.FC<TicketsProps> = ({ go }) => {
  const { selectCategory } = useCart();
  const [passes, setPasses] = useState<FestivalPass[]>([]);

  useEffect(() => {
    // Synchronisation automatique avec le catalogue des passes (admin + public)
    const published = passService.getPublishedPasses();
    setPasses(published);
  }, []);

  const handleReserve = (passId: string) => {
    selectCategory(passId);
    go('/billets/commande');
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 select-none max-w-6xl mx-auto">
      <div>
        {/* Titre BILLETS brutaliste */}
        <div className="mb-8 sm:mb-12">
          <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
            ÉDITION 05 · ABIDJAN · MARCORY ZONE 4
          </span>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
            BILLETS
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/70 mt-2 uppercase tracking-wide">
            CATALOGUE OFFICIEL DES PASS · DÉFILEMENT VERTICAL
          </p>
        </div>

        {/* ALIGNEMENT STRICTEMENT VERTICAL SOUS FORME DE LISTE POUR ACCUEILLIR DE NOMBREUX PASS */}
        <div className="flex flex-col space-y-6 sm:space-y-8 w-full">
          {passes.map((pass) => {
            const isSoldOut = pass.status === 'SOLD_OUT';
            const percentSold = Math.min(
              100,
              Math.round((pass.quotaSold / (pass.quotaTotal || 1)) * 100)
            );

            return (
              <div
                key={pass.id}
                className={`border-[5px] sm:border-[6px] p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between text-left transition-all duration-200 group ${
                  isSoldOut
                    ? 'border-zinc-600 bg-zinc-900/60 opacity-80'
                    : 'border-[#F4F1EA] bg-[#142B1A]/80 hover:bg-[#C85A17] hover:border-[#C85A17]'
                }`}
              >
                {/* Informations du Pass (Nom, Prix, Perks, Jours) */}
                <div className="flex-1 pr-0 md:pr-8 mb-6 md:mb-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="bg-[#C85A17] group-hover:bg-[#F4F1EA] text-[#F4F1EA] group-hover:text-[#142B1A] px-2.5 py-0.5 text-xs font-display tracking-widest uppercase font-bold transition-colors">
                      {pass.days}
                    </span>
                    {isSoldOut && (
                      <span className="bg-red-600 text-white px-2.5 py-0.5 text-xs font-display tracking-widest uppercase font-bold">
                        ÉPUISÉ
                      </span>
                    )}
                    {!isSoldOut && percentSold > 70 && (
                      <span className="text-amber-300 text-xs font-mono font-bold tracking-wider">
                        • DERNIERS BILLETS ({percentSold}% VENDUS)
                      </span>
                    )}
                  </div>

                  <h2 className="font-display leading-[0.9]">
                    <span className="text-[#F4F1EA] text-4xl sm:text-6xl lg:text-7xl block">
                      [ {pass.name}
                    </span>
                    <span className="text-[#C85A17] group-hover:text-[#F4F1EA] text-4xl sm:text-6xl lg:text-7xl block mt-1 transition-colors duration-150">
                      {pass.price} ]
                    </span>
                  </h2>

                  <p className="font-display text-xl sm:text-2xl lg:text-3xl text-[#F4F1EA] mt-4 uppercase">
                    {pass.perks}
                  </p>

                  <p className="font-display text-xs sm:text-sm text-[#F4F1EA]/80 group-hover:text-[#F4F1EA] mt-2 uppercase tracking-wide">
                    {pass.note}
                  </p>
                </div>

                {/* Bouton d'action [ RÉSERVER ] ou [ ÉPUISÉ ] */}
                <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                  {isSoldOut ? (
                    <button
                      type="button"
                      disabled
                      className="px-8 sm:px-10 py-4 border-2 border-zinc-500 font-display text-xl sm:text-2xl text-zinc-400 uppercase tracking-wider bg-transparent cursor-not-allowed"
                    >
                      [ ÉPUISÉ ]
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReserve(pass.id)}
                      className="w-full md:w-auto px-8 sm:px-12 py-4 border-2 border-[#F4F1EA] font-display text-xl sm:text-2xl text-[#F4F1EA] uppercase tracking-wider bg-transparent group-hover:bg-[#F4F1EA] group-hover:text-[#142B1A] transition-colors cursor-pointer text-center"
                    >
                      [ RÉSERVER ]
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-12 pb-4 text-xs font-body text-[#F4F1EA]/60 uppercase tracking-widest text-center sm:text-left">
        TARIFS OFFICIELS · MOTHER AFRICA FESTIVAL 2026 · MARCORY ZONE 4
      </div>
    </div>
  );
};
