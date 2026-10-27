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
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
          LE FESTIVAL
        </h1>
        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#C85A17] leading-none mt-2">
          {FACTS.edition}
        </h2>

        {/* 3 blocs avec barre haute terracotta de 6px directement sur le fond */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12">
          <div className="border-t-[6px] border-[#C85A17] pt-4">
            <span className="font-display text-xs sm:text-sm text-[#C85A17] block uppercase">
              DATES
            </span>
            <div className="font-display text-3xl sm:text-4xl text-[#F4F1EA] mt-1">
              {FACTS.dates}
            </div>
          </div>

          <div className="border-t-[6px] border-[#C85A17] pt-4">
            <span className="font-display text-xs sm:text-sm text-[#C85A17] block uppercase">
              LIEU
            </span>
            <div className="font-display text-3xl sm:text-4xl text-[#F4F1EA] mt-1">
              {FACTS.lieu}
            </div>
          </div>

          <div className="border-t-[6px] border-[#C85A17] pt-4">
            <span className="font-display text-xs sm:text-sm text-[#C85A17] block uppercase">
              VILLE
            </span>
            <div className="font-display text-3xl sm:text-4xl text-[#F4F1EA] mt-1">
              {FACTS.ville}
            </div>
          </div>
        </div>

        {/* Texte officiel signalé */}
        <div className="mt-12 max-w-2xl">
          <p className="font-body text-sm sm:text-base text-[#F4F1EA]/80 leading-relaxed">
            Le texte officiel de présentation sera intégré ici.
          </p>
        </div>
      </div>

      <div className="pt-12 pb-4 text-xs font-body text-[#F4F1EA]/60 uppercase tracking-widest">
        MOTHER AFRICA FESTIVAL 2026 · MARCORY ZONE 4 · ABIDJAN
      </div>
    </div>
  );
};
