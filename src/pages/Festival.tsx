/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FACTS } from '../data.ts';

export const Festival: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 select-none">
      <div>
        {/* Titre & Édition */}
        <div className="mb-10 sm:mb-14">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
            LE FESTIVAL
          </h1>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#C85A17] leading-none mt-2">
            {FACTS.edition}
          </h2>
        </div>

        {/* Trois blocs avec une barre haute terracotta de 6px */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pt-4">
          {/* Bloc 1: DATES */}
          <div className="border-t-[6px] border-[#C85A17] pt-4">
            <span className="font-display text-xs sm:text-sm tracking-widest text-[#F4F1EA]/80 block uppercase mb-1">
              DATES
            </span>
            <div className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#F4F1EA] leading-tight">
              {FACTS.dates}
            </div>
          </div>

          {/* Bloc 2: LIEU */}
          <div className="border-t-[6px] border-[#C85A17] pt-4">
            <span className="font-display text-xs sm:text-sm tracking-widest text-[#F4F1EA]/80 block uppercase mb-1">
              LIEU
            </span>
            <div className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#F4F1EA] leading-tight">
              {FACTS.lieu}
            </div>
          </div>

          {/* Bloc 3: VILLE */}
          <div className="border-t-[6px] border-[#C85A17] pt-4">
            <span className="font-display text-xs sm:text-sm tracking-widest text-[#F4F1EA]/80 block uppercase mb-1">
              VILLE
            </span>
            <div className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#F4F1EA] leading-tight">
              {FACTS.ville}
            </div>
          </div>
        </div>

        {/* Emplacement signalé pour le texte officiel */}
        <div className="mt-12 sm:mt-16 max-w-3xl">
          <p className="font-body text-sm sm:text-base text-[#F4F1EA]/80 leading-relaxed">
            Le texte officiel de présentation (vision, histoire, identité du festival) sera intégré ici.
          </p>
        </div>
      </div>

      <div className="pt-12 pb-4 text-xs font-body text-[#F4F1EA]/60 uppercase tracking-widest">
        MOTHER AFRICA FESTIVAL 2026 · MARCORY ZONE 4 · ABIDJAN
      </div>
    </div>
  );
};
