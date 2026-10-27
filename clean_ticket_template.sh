#!/bin/bash
# 1. Copier l'image originale
cp public/assets/aistudio/Capture_d__cran_2026-10-27_020734_f659d576.png public/assets/ticket_base_raw.png

# 2. Créer une version base nettoyée où les zones dynamiques sont préparées pour la superposition React
# Échantillonner la couleur verte du fond central
convert public/assets/ticket_base_raw.png \
  -fill "#0E2314" -draw "rectangle 330,150 500,244" \
  -fill "#0D2214" -draw "rectangle 60,30 240,56" \
  -fill "#0C1F12" -draw "rectangle 570,55 735,245" \
  public/assets/ticket_panoramic_base.png

ls -lh public/assets/ticket_panoramic_base.png
