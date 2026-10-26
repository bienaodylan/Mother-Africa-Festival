/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EDITIONS } from '../data.ts';

export const Archives: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 select-none">
      <div>
        {/* Titre ARCHIVES */}
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none mb-8 sm:mb-12">
          ARCHIVES
        </h1>

        {/* Liste de 4 lignes géantes « ÉDITION 04 » à « ÉDITION 01 » */}
        <div className="w-full">
          {EDITIONS.map((edition) => (
            <div
              key={edition}
              className="border-t border-[#F4F1EA]/30 last:border-b last:border-[#F4F1EA]/30 py-5 sm:py-8 lg:py-10 px-1 sm:px-3 flex items-center justify-between group transition-colors duration-150 cursor-default"
            >
              <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none text-[#F4F1EA] group-hover:text-[#C85A17] transition-colors duration-150">
                {edition}
              </h2>

              <span className="font-display text-xs sm:text-base lg:text-lg text-[#F4F1EA] group-hover:text-[#C85A17] transition-colors duration-150 uppercase tracking-wider shrink-0 ml-4">
                AFFICHE & PHOTOS À INTÉGRER
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-12 pb-4 text-xs font-body text-[#F4F1EA]/60 uppercase tracking-widest">
        HISTORIQUE OFFICIEL · MOTHER AFRICA FESTIVAL
      </div>
    </div>
  );
};
