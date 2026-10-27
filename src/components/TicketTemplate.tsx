/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TicketProps {
  category?: string;
  ticketNumber?: string;
  buyerName?: string;
  artistName?: string;
  artistSubtitle?: string;
  artistImage?: string;
  qrCodeUrl?: string;
  eventDates?: string;
  location?: string;
  price?: string;
  statusText?: string;
  statusColor?: string;
  onShowQr?: () => void;
  className?: string;
}

export default function TicketTemplate({
  category = 'GRAND PUBLIC',
  ticketNumber = 'N° 0001',
  buyerName = "EZT'ET ZEGRE",
  artistName = 'DAVIDO',
  artistSubtitle = '& GUESTS',
  artistImage = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  qrCodeUrl = '/path-to-qr.png',
  eventDates = '27 & 28 DÉCEMBRE 2026',
  location = 'MARCORY ZONE 4',
  price = '10 000 FCFA',
  statusText = '✓ CONFIRMÉ - VALIDE',
  statusColor = 'text-[#22c55e]',
  onShowQr,
  className = ''
}: TicketProps) {
  return (
    // CONTENEUR DU BILLET : SANS AUCUN ARRIÈRE-PLAN BLANC AUTOUR (100% transparent à l'extérieur)
    <div
      className={`relative w-full max-w-5xl mx-auto bg-transparent select-none p-0 ${className}`}
    >
      {/* LA CARTE DU TICKET PANORAMIQUE AVEC BORDS ARRONDIS ET CONTOUR TERRACOTTA */}
      <div className="relative flex flex-row w-full aspect-[21/9] min-h-[170px] sm:min-h-[220px] md:min-h-[260px] lg:min-h-[280px] bg-[#0D1E13] rounded-2xl sm:rounded-3xl overflow-hidden font-display text-[#F4F1EA] shadow-2xl border-2 border-[#C85A17] ring-1 ring-black/40">
        
        {/* TEXTURE SVG : MOTIFS TOPOGRAPHIQUES ET ONDES AFRICAINES TERRACOTTA */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1000 400"
        >
          {/* Ondes en bas à gauche */}
          <path
            d="M -50,380 Q 80,340 180,390 T 380,360 T 500,400"
            fill="none"
            stroke="#C85A17"
            strokeWidth="6"
          />
          <path
            d="M -50,350 Q 80,310 180,360 T 380,330 T 500,370"
            fill="none"
            stroke="#C85A17"
            strokeWidth="5"
          />
          <path
            d="M -50,320 Q 80,280 180,330 T 380,300 T 500,340"
            fill="none"
            stroke="#C85A17"
            strokeWidth="4"
          />
          <path
            d="M -50,290 Q 80,250 180,300 T 380,270 T 500,310"
            fill="none"
            stroke="#C85A17"
            strokeWidth="3"
          />
          
          {/* Ondes en bas au centre / droite */}
          <path
            d="M 520,380 Q 640,320 740,390 T 900,360 T 1050,400"
            fill="none"
            stroke="#C85A17"
            strokeWidth="6"
          />
          <path
            d="M 520,350 Q 640,290 740,360 T 900,330 T 1050,370"
            fill="none"
            stroke="#C85A17"
            strokeWidth="5"
          />
          <path
            d="M 520,320 Q 640,260 740,330 T 900,300 T 1050,340"
            fill="none"
            stroke="#C85A17"
            strokeWidth="4"
          />
          <path
            d="M 520,290 Q 640,230 740,300 T 900,270 T 1050,310"
            fill="none"
            stroke="#C85A17"
            strokeWidth="3"
          />
        </svg>

        {/* ========================================================
            BLOC 1 : ARTISTE, CATÉGORIE & NUMÉRO UNIQUE (GAUCHE - ~34%)
            ======================================================== */}
        <div className="relative w-[34%] h-full p-2.5 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden shrink-0 z-10">
          {/* En-tête : Badge Catégorie + Numéro de billet */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 z-20">
            <span className="bg-[#C85A17] text-[#F4F1EA] px-2 sm:px-3 py-0.5 rounded-sm text-[10px] sm:text-xs md:text-sm uppercase tracking-wider font-bold truncate max-w-[130px] sm:max-w-none shadow-sm">
              {category}
            </span>
            <span className="text-[#F4F1EA] text-[10px] sm:text-xs md:text-sm font-mono font-bold tracking-wider">
              {ticketNumber}
            </span>
          </div>

          {/* Graphisme solaire rayonnant derrière l'artiste */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-[#C85A17]/80 rounded-full blur-[1px] pointer-events-none -z-10 shadow-inner flex items-center justify-center">
            {/* Rayons solaires concentriques */}
            <div className="w-full h-full rounded-full border-4 border-[#C85A17]/40 scale-125" />
          </div>

          {/* Soleil secondaire décoratif rayonnant */}
          <div className="absolute top-3 right-0 sm:right-2 w-10 h-10 sm:w-16 sm:h-16 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#C85A17] animate-spin-slow">
              <circle cx="50" cy="50" r="16" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}
                  y2={50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}
                  stroke="#C85A17"
                  strokeWidth="3"
                />
              ))}
            </svg>
          </div>

          {/* Photo portrait de l'artiste */}
          <img
            src={artistImage}
            alt={artistName}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[92%] sm:h-[105%] max-w-none object-cover object-top pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] -z-10"
          />

          {/* Typographie massive : Artiste & Guests */}
          <div className="mt-auto pt-1 z-20">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.85] tracking-tight drop-shadow-md text-[#F4F1EA] truncate font-display">
              {artistName}
            </h2>
            <p className="text-[#EAD9A4] text-[9px] sm:text-xs md:text-sm lg:text-base uppercase tracking-widest font-bold mt-0.5">
              {artistSubtitle}
            </p>
          </div>
        </div>

        {/* ========================================================
            BLOC 2 : INFOS FESTIVAL, ACHETEUR, DATES & TARIF (CENTRE - ~41%)
            ======================================================== */}
        <div className="relative w-[41%] h-full flex flex-col items-center justify-center text-center p-2 sm:p-4 md:p-5 z-10 shrink-0">
          {/* Logo Officiel Stylisé Mother Africa Festival */}
          <div className="mb-2 sm:mb-4 flex flex-col items-center">
            <div className="flex flex-col items-center leading-none">
              <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-widest text-[#EAD9A4] font-display">
                MꝊTHER
              </span>
              <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-widest text-[#EAD9A4] font-display -mt-1 sm:-mt-1.5">
                AFRICA
              </span>
            </div>
            <div className="w-full border-t border-[#EAD9A4]/60 mt-1 pt-0.5">
              <span className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm tracking-[0.35em] text-[#EAD9A4] uppercase font-bold block">
                FESTIVAL
              </span>
            </div>
          </div>

          {/* Données personnalisées injectées */}
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 w-full px-1">
            {/* Nom du titulaire */}
            <h3 className="text-sm sm:text-xl md:text-2xl lg:text-3xl text-[#F4F1EA] uppercase truncate max-w-full font-display">
              {buyerName}
            </h3>

            {/* Dates du festival */}
            <p className="text-[#C85A17] text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wider font-bold">
              {eventDates}
            </p>

            {/* Lieu */}
            <p className="text-[#EAD9A4] text-[8px] sm:text-[10px] md:text-xs lg:text-sm uppercase tracking-wider">
              {location}
            </p>

            {/* Prix du pass */}
            <p className="text-[#C85A17] text-xs sm:text-base md:text-lg lg:text-xl uppercase tracking-wider font-bold mt-0.5 sm:mt-1">
              {price}
            </p>
          </div>
        </div>

        {/* ========================================================
            SÉPARATEUR POINTILLÉ VERTICAL (PERFORATION)
            ======================================================== */}
        <div className="w-[1px] sm:w-[2px] h-[85%] my-auto border-l-2 sm:border-l-4 border-dashed border-[#F4F1EA]/40 z-10 shrink-0" />

        {/* ========================================================
            BLOC 3 : QR CODE SÉCURISÉ & CONTRÔLE D'ACCÈS (DROITE - ~25%)
            ======================================================== */}
        <div className="relative w-[25%] h-full flex flex-col items-center justify-center p-1.5 sm:p-3 md:p-4 z-10 shrink-0">
          {/* Titre Agrandir le QR */}
          <button
            type="button"
            onClick={onShowQr}
            className="text-[#EAD9A4] font-body font-bold text-[8px] sm:text-[10px] md:text-xs tracking-wider uppercase mb-1 sm:mb-2 hover:text-[#C85A17] cursor-pointer transition-colors"
          >
            AGRANDIR LE QR
          </button>

          {/* Cadre carré blanc pour contraste optimal du scanner */}
          <div
            onClick={onShowQr}
            className="bg-white p-1 sm:p-1.5 md:p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-lg border border-black/10"
            title="Cliquer pour agrandir le QR Code"
          >
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`QR Code Billet ${ticketNumber}`}
                className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
              />
            ) : (
              <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-zinc-200 animate-pulse" />
            )}
          </div>

          {/* État d'accès */}
          <div className="mt-1 sm:mt-2 text-center">
            <span className="text-[#EAD9A4]/80 font-body text-[7px] sm:text-[9px] md:text-[10px] uppercase tracking-wider block">
              ÉTAT D'ACCÈS
            </span>
            <span
              className={`${statusColor} text-[8px] sm:text-xs md:text-sm uppercase tracking-wider font-bold block leading-tight font-display`}
            >
              {statusText}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
