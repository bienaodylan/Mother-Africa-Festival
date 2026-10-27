/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DAYS, ARTISTS, Artist, FACTS } from '../data.ts';

interface LineupProps {
  setBg: (image: string | null) => void;
}

export const Lineup: React.FC<LineupProps> = ({ setBg }) => {
  const [day, setDay] = useState<1 | 2>(1);
  const [activeArtistId, setActiveArtistId] = useState<string | null>(null);

  const filteredArtists = ARTISTS.filter((artist) => artist.day === day);
  const currentDayInfo = DAYS.find((d) => d.id === day);

  const headliners = filteredArtists.filter((a) => a.tier === 'headliner');
  const regularArtists = filteredArtists.filter((a) => a.tier === 'artist');
  const djSets = filteredArtists.filter((a) => a.tier === 'dj');

  const handleSelectDay = (selectedDay: 1 | 2) => {
    setDay(selectedDay);
    setActiveArtistId(null);
    setBg(null);
  };

  const handleArtistEnter = (artist: Artist) => {
    setActiveArtistId(artist.id);
    if (artist.image && artist.image.trim() !== '') {
      setBg(artist.image);
    } else {
      setBg(null);
    }
  };

  const handleArtistLeave = () => {
    setActiveArtistId(null);
    setBg(null);
  };

  const handleArtistClick = (artist: Artist) => {
    if (activeArtistId === artist.id) {
      setActiveArtistId(null);
      setBg(null);
    } else {
      setActiveArtistId(artist.id);
      if (artist.image && artist.image.trim() !== '') {
        setBg(artist.image);
      } else {
        setBg(null);
      }
    }
  };

  const renderArtistGroup = (title: string, groupArtists: Artist[]) => {
    if (groupArtists.length === 0) return null;

    return (
      <div className="mb-8 sm:mb-12">
        {/* En-tête de catégorie brutaliste */}
        <div className="flex items-center gap-3 mb-3 sm:mb-5">
          <span className="h-0.5 w-6 sm:w-10 bg-[#C85A17]" />
          <h3 className="font-display text-base sm:text-xl text-[#C85A17] tracking-wider uppercase">
            {title} ({groupArtists.length})
          </h3>
          <span className="h-0.5 flex-1 bg-[#F4F1EA]/15" />
        </div>

        <ul className="w-full list-none p-0 m-0">
          {groupArtists.map((artist) => {
            const isItemActive = activeArtistId === artist.id;

            return (
              <li
                key={artist.id}
                className="border-b border-[#F4F1EA]/20 transition-colors"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') {
                      handleArtistEnter(artist);
                    }
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === 'mouse') {
                      handleArtistLeave();
                    }
                  }}
                  onClick={() => handleArtistClick(artist)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleArtistClick(artist);
                    }
                  }}
                  className={`w-full py-4 sm:py-6 flex items-baseline justify-between text-left cursor-pointer transition-colors duration-150 group select-none ${
                    isItemActive
                      ? 'text-[#C85A17]'
                      : 'text-[#F4F1EA] hover:text-[#C85A17]'
                  }`}
                >
                  <div className="flex items-baseline gap-3 sm:gap-6 flex-wrap">
                    <span className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none">
                      {artist.name}
                    </span>
                    {artist.tier === 'headliner' && (
                      <span className="font-display text-xs sm:text-sm px-2.5 py-0.5 bg-[#C85A17] text-[#F4F1EA] uppercase tracking-wider rounded-xs">
                        HEADLINER
                      </span>
                    )}
                    {artist.tier === 'dj' && (
                      <span className="font-display text-xs sm:text-sm px-2.5 py-0.5 border border-[#F4F1EA]/40 text-[#F4F1EA]/80 uppercase tracking-wider rounded-xs">
                        DJ SET
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-xs sm:text-sm text-[#F4F1EA]/40 group-hover:text-[#C85A17] transition-colors shrink-0 ml-4 hidden sm:inline">
                    {artist.tierLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 select-none max-w-7xl mx-auto">
      <div>
        {/* Titre & Édition alignés avec le format d'origine (comme Festival / Archives) */}
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
          PROGRAMME
        </h1>
        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#C85A17] leading-none mt-2">
          4TH EDITION · 2026
        </h2>
        <p className="font-display text-sm sm:text-lg text-[#F4F1EA]/70 tracking-wider mt-3 mb-8 sm:mb-12 uppercase">
          25 ARTISTES & DJ SETS · {FACTS.lieu}, {FACTS.ville}
        </p>

        {/* Haut de page : Onglets des Jours format d'origine brutaliste */}
        <div
          role="tablist"
          aria-label="Jours du festival"
          className="grid grid-cols-2 gap-2 sm:gap-6 mb-8 sm:mb-12 w-full"
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
                className={`border-2 sm:border-4 px-2.5 sm:px-8 py-2.5 sm:py-4 text-left transition-colors duration-150 cursor-pointer w-full flex flex-col justify-center ${
                  isActive
                    ? 'bg-[#C85A17] border-[#C85A17] text-[#F4F1EA]'
                    : 'bg-transparent border-[#F4F1EA] text-[#F4F1EA] hover:border-[#C85A17] hover:text-[#C85A17]'
                }`}
              >
                <span className="font-display text-xl xs:text-2xl sm:text-4xl lg:text-5xl block leading-tight whitespace-nowrap">
                  {d.label}
                </span>
                <span className="font-display text-[9px] xs:text-[10px] sm:text-xs md:text-sm tracking-wider block mt-0.5 sm:mt-1 uppercase opacity-90 truncate">
                  {d.date} · {d.startTime}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mention Spéciale Day 2 si sélectionné */}
        {day === 2 && currentDayInfo?.note && (
          <div className="mb-8 p-4 bg-[#C85A17]/20 border-2 border-[#C85A17] rounded-none flex items-center gap-3">
            <span className="text-xl">⚽</span>
            <div className="font-display text-sm sm:text-lg text-[#F4F1EA] tracking-wide uppercase">
              DIFFUSION EN DIRECT DU MATCH CÔTE D'IVOIRE – CAMEROUN SUR ÉCRAN GÉANT
            </div>
          </div>
        )}

        {/* Liste des artistes du jour sélectionné */}
        <div
          id={`tabpanel-day-${day}`}
          role="tabpanel"
          aria-labelledby={`tab-day-${day}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={day}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* 1. Têtes d'affiche */}
              {renderArtistGroup("Têtes d'affiche", headliners)}

              {/* 2. Artistes */}
              {renderArtistGroup('Artistes', regularArtists)}

              {/* 3. DJ Sets */}
              {renderArtistGroup('DJ Sets', djSets)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RÈGLE STRICTE OBLIGATOIRE : Mention en bas du programme */}
      <div className="mt-14 pt-8 border-t-4 border-[#C85A17] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-[#C85A17] text-[#F4F1EA] px-4 py-2 font-display text-base sm:text-xl tracking-wider uppercase font-bold">
          <span>⚠️</span>
          <span>TOUTE SORTIE EST DÉFINITIVE</span>
        </div>
        <p className="font-mono text-xs sm:text-sm text-[#F4F1EA]/70 uppercase tracking-widest text-center sm:text-right">
          MOTHER AFRICA FESTIVAL 2026 · PROGRAMME OFFICIEL 4TH EDITION
        </p>
      </div>
    </div>
  );
};
