/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DAYS, ARTISTS, Artist } from '../data.ts';

interface LineupProps {
  setBg: (image: string | null) => void;
}

export const Lineup: React.FC<LineupProps> = ({ setBg }) => {
  const [day, setDay] = useState<1 | 2>(1);
  const [active, setActive] = useState<string | null>(null);
  const lastPointerType = useRef<string>('mouse');

  const filteredArtists = ARTISTS.filter((artist) => artist.day === day);

  const handleSelectDay = (selectedDay: 1 | 2) => {
    setDay(selectedDay);
    setActive(null);
    setBg(null);
  };

  const handlePointerEnter = (artist: Artist, e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setActive(artist.id);
      setBg(artist.image);
    }
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setActive(null);
      setBg(null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    lastPointerType.current = e.pointerType;
  };

  const handleClick = (artist: Artist) => {
    // Si ce n'est pas la souris (ex: tap sur mobile / tactile), bascule l'artiste actif
    if (lastPointerType.current !== 'mouse') {
      if (active === artist.id) {
        setActive(null);
        setBg(null);
      } else {
        setActive(artist.id);
        setBg(artist.image);
      }
    }
  };

  const handleFocus = (artist: Artist) => {
    setActive(artist.id);
    setBg(artist.image);
  };

  const handleBlur = () => {
    setActive(null);
    setBg(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 select-none">
      <div>
        {/* Haut de page : deux gros boutons bloc en role="tab" */}
        <div
          role="tablist"
          aria-label="Jours du festival"
          className="flex items-center gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {DAYS.map((d) => {
            const isActive = day === d.id;
            return (
              <button
                key={d.id}
                role="tab"
                id={`tab-day-${d.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-day-${d.id}`}
                type="button"
                onClick={() => handleSelectDay(d.id)}
                className={`border-4 px-6 sm:px-10 py-3 sm:py-4 text-left transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#C85A17] border-[#C85A17] text-[#F4F1EA]'
                    : 'bg-transparent border-[#F4F1EA] text-[#F4F1EA] hover:border-[#C85A17] hover:text-[#C85A17]'
                }`}
              >
                <span className="font-display text-4xl sm:text-6xl block leading-none">
                  {d.label}
                </span>
                <span className="font-display text-xs sm:text-sm tracking-wider block mt-1 uppercase">
                  {d.date}
                </span>
              </button>
            );
          })}
        </div>

        {/* Liste filtrée sur le jour avec transition AnimatePresence */}
        <div
          id={`tabpanel-day-${day}`}
          role="tabpanel"
          aria-labelledby={`tab-day-${day}`}
        >
          <AnimatePresence mode="wait">
            <motion.ul
              key={day}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full list-none p-0 m-0"
            >
              {filteredArtists.map((artist) => {
                const isItemActive = active === artist.id;
                return (
                  <li
                    key={artist.id}
                    className="border-t border-[#F4F1EA]/30 last:border-b last:border-[#F4F1EA]/30"
                  >
                    <button
                      type="button"
                      aria-pressed={isItemActive}
                      onPointerDown={handlePointerDown}
                      onPointerEnter={(e) => handlePointerEnter(artist, e)}
                      onPointerLeave={handlePointerLeave}
                      onClick={() => handleClick(artist)}
                      onFocus={() => handleFocus(artist)}
                      onBlur={handleBlur}
                      className="w-full py-4 sm:py-6 lg:py-8 px-1 sm:px-3 flex items-center justify-between text-left cursor-pointer transition-colors duration-150 group"
                    >
                      <span
                        className={`font-display text-5xl sm:text-7xl lg:text-8xl leading-none transition-colors duration-150 ${
                          isItemActive
                            ? 'text-[#C85A17]'
                            : 'text-[#F4F1EA] group-hover:text-[#C85A17]'
                        }`}
                      >
                        {artist.name}
                      </span>

                      <span
                        className={`font-display text-2xl sm:text-4xl lg:text-5xl leading-none shrink-0 ml-4 transition-colors duration-150 ${
                          isItemActive
                            ? 'text-[#C85A17]'
                            : 'text-[#F4F1EA] group-hover:text-[#C85A17]'
                        }`}
                      >
                        {artist.slot}
                      </span>
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>

      {/* Note de bas de page */}
      <div className="pt-10 pb-4">
        <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/70">
          Line-up de démonstration. Les noms et photos sont des placeholders en attendant la programmation officielle.
        </p>
      </div>
    </div>
  );
};
