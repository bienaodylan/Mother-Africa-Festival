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

        {/* 4 lignes simples sans aucune boîte noire, directement sur le fond */}
        <div className="w-full">
          {EDITIONS.map((edition) => (
            <div
              key={edition}
              className="border-t border-[#F4F1EA]/30 py-6 sm:py-8 flex flex-wrap items-center justify-between gap-4 group cursor-default"
            >
              <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-none text-[#F4F1EA] group-hover:text-[#C85A17] transition-colors duration-150">
                {edition}
              </h2>

              <span className="font-display text-xs sm:text-sm text-[#C85A17] group-hover:text-[#F4F1EA] transition-colors duration-150 uppercase tracking-widest shrink-0">
                [ AFFICHE & PHOTOS À INTÉGRER ]
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-12 pb-4 text-xs font-body text-[#F4F1EA]/60 uppercase tracking-widest">
        ARCHIVES DU FESTIVAL · ÉDITIONS 2022 À 2025
      </div>
    </div>
  );
};
