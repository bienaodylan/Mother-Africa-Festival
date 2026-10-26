/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo.tsx';
import { MENU, FACTS } from '../data.ts';

interface HomeProps {
  go: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ go }) => {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between select-none">
      {/* Zone du haut (flex-1) : centre verticalement logo et textes */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16">
        <Logo size="large" />

        <div className="mt-6 sm:mt-8 space-y-1 sm:space-y-2">
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl text-[#F4F1EA] tracking-normal leading-tight">
            {FACTS.edition}
          </h1>
          <p className="font-display text-xl sm:text-3xl lg:text-4xl text-[#C85A17] tracking-normal leading-tight">
            {FACTS.dates} · {FACTS.lieu}
          </p>
        </div>
      </div>

      {/* Accordéon ancré au bas de l'écran */}
      <nav aria-label="Menu principal du festival" className="w-full">
        {MENU.map((item, index) => {
          const isOpen = open === item.id;
          const isLast = index === MENU.length - 1;
          const panelId = `accordion-panel-${item.id}`;
          const buttonId = `accordion-btn-${item.id}`;

          return (
            <div
              key={item.id}
              className={`border-t border-[#F4F1EA]/40 ${
                isLast ? 'border-b border-[#F4F1EA]/40' : ''
              }`}
            >
              <h2>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                  className={`w-full px-4 sm:px-8 lg:px-12 py-3.5 sm:py-5 flex items-center justify-between text-left cursor-pointer transition-colors duration-150 ${
                    isOpen
                      ? 'bg-[#C85A17] text-[#F4F1EA]'
                      : 'bg-transparent text-[#F4F1EA] hover:text-[#C85A17]'
                  }`}
                >
                  <span className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none">
                    {item.label}
                  </span>
                  <span
                    className="font-display text-4xl sm:text-6xl lg:text-7xl leading-none shrink-0 ml-4"
                    aria-hidden="true"
                  >
                    {isOpen ? '–' : '+'}
                  </span>
                </button>
              </h2>

              {/* Contenu déplié avec Framer Motion */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="relative min-h-[220px] sm:min-h-[280px] flex items-end p-6 sm:p-10 lg:p-12 overflow-hidden">
                      {/* Photo de concert d'arrière-plan */}
                      <img
                        src={item.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover grayscale-[.3] contrast-125"
                        referrerPolicy="no-referrer"
                      />

                      {/* Dégradé sombre */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />

                      {/* Contenu aligné en bas */}
                      <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <p className="font-body italic text-lg sm:text-2xl text-[#F4F1EA] max-w-xl leading-relaxed">
                          « {item.teaser} »
                        </p>

                        <button
                          type="button"
                          onClick={() => go(item.route)}
                          className="brut-btn whitespace-nowrap self-start sm:self-auto text-xl sm:text-2xl"
                        >
                          [ EXPLORER ]
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
