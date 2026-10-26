/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: 'large' | 'small';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ size = 'large', onClick }) => {
  const isLarge = size === 'large';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* « 2026 » en terracotta au coin supérieur droit (comme sur l'affiche officielle) */}
      <span
        className={`absolute font-display text-[#C85A17] z-20 leading-none ${
          isLarge
            ? '-top-3 sm:-top-5 -right-2 sm:-right-4 text-2xl sm:text-4xl'
            : '-top-1.5 -right-1 text-xs sm:text-sm'
        }`}
      >
        2026
      </span>

      {/* Logo Officiel Mother Africa avec glyphes tribaux en blanc crème (#F4F1EA) sur fond transparent */}
      <div className="relative flex items-center justify-center">
        <img
          src="/assets/mother-africa-official-logo.png"
          alt="Mother Africa Festival Logo Officiel"
          className={`h-auto object-contain transition-transform duration-150 ${
            isLarge
              ? 'w-64 sm:w-80 md:w-96 lg:w-[420px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
              : 'w-24 sm:w-32 hover:opacity-90'
          }`}
          draggable={false}
        />
      </div>
    </div>
  );
};
