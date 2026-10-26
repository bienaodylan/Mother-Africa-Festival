/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundProps {
  image: string | null;
}

export const Background: React.FC<BackgroundProps> = ({ image }) => {
  // 2. Vagues topographiques en SVG pré-calculées avec useMemo
  // 28 tracés (i de -2 à 25)
  // Chaque tracé est une polyligne : x de -40 à 1640 par pas de 20
  // y = i*46 + 34*sin(x/210 + i*0.37) + 20*sin(x/95 - i*0.61) + 14*sin(x/470 + i*0.12)
  const wavePaths = useMemo(() => {
    const paths: { d: string; opacity: number }[] = [];

    for (let i = -2; i <= 25; i++) {
      let d = '';
      for (let x = -40; x <= 1640; x += 20) {
        const y =
          i * 46 +
          34 * Math.sin(x / 210 + i * 0.37) +
          20 * Math.sin(x / 95 - i * 0.61) +
          14 * Math.sin(x / 470 + i * 0.12);

        if (x === -40) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
      const opacity = 0.2 + 0.1 * Math.sin(i * 0.5);
      paths.push({ d, opacity: Math.max(0.08, opacity) });
    }

    return paths;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Couche 1 : Fond uni forest */}
      <div className="absolute inset-0 bg-[#142B1A]" />

      {/* Couche 2 : Vagues topographiques en SVG */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {wavePaths.map((wave, index) => (
          <path
            key={index}
            d={wave.d}
            fill="none"
            stroke="#C85A17"
            strokeWidth={15}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={wave.opacity}
          />
        ))}
      </svg>

      {/* Couche 3 : Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,.72) 100%)'
        }}
      />

      {/* Par-dessus : Photo plein écran en fondu enchaîné via AnimatePresence */}
      <AnimatePresence>
        {image && (
          <motion.div
            key={image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover contrast-125 grayscale-[.2]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
