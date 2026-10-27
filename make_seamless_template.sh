#!/bin/bash
# 1. Extraire la colonne propre de dégradé au niveau de x=510..550
convert public/assets/aistudio/Capture_d__cran_2026-10-27_020734_f659d576.png \
  -crop 35x105+515+140 +repage -resize 190x105\! temp_center_patch.png

# 2. Extraire la couleur d'arrière plan sombre pour la partie droite du QR code
convert public/assets/aistudio/Capture_d__cran_2026-10-27_020734_f659d576.png \
  -crop 20x20+750+240 +repage -resize 214x276\! temp_right_patch.png

# 3. Extraire la zone supérieure propre au-dessus de Davido pour le badge
convert public/assets/aistudio/Capture_d__cran_2026-10-27_020734_f659d576.png \
  -crop 40x26+270+26 +repage -resize 190x26\! temp_badge_patch.png

# 4. Assembler sur l'image d'origine
convert public/assets/aistudio/Capture_d__cran_2026-10-27_020734_f659d576.png \
  temp_center_patch.png -geometry +325+140 -composite \
  temp_right_patch.png -geometry +568+0 -composite \
  temp_badge_patch.png -geometry +55+26 -composite \
  public/assets/ticket_template_perfect.png

rm -f temp_center_patch.png temp_right_patch.png temp_badge_patch.png
ls -lh public/assets/ticket_template_perfect.png
