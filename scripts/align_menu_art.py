import subprocess
import os

# Let's inspect the exact regions in IMG_5320_4b28c10f.jpeg (2476 x 1696)
# Row 1: FESTIVAL (y ~ 80..460)
# Row 2: LINE-UP (y ~ 490..850)
# Row 3: BILLET (y ~ 870..1250)
# Row 4: ARCHIVES (y ~ 1270..1650)

# Let's write a python script to inspect the exact bounding box of the letters in each row:
src_img = 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg'

# 1. FESTIVAL:
# Let's crop without the leftmost dot. In raw_fest (width 1200), F starts around x=101.
# In full resolution (2476w), x=101 * 2476 / 1200 ~= 208.
# Let's inspect columns around 180..240 in row 1.
print("Analyzing...")
