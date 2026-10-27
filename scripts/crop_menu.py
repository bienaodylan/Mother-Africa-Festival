import subprocess
import os

os.makedirs('public/assets/menu_art', exist_ok=True)

# 1. First, let's create downscaled crops directly with ImageMagick so they are fast and light
# Image is 2476x1696. A height of ~160px for each word is more than enough for crisp HD retina display!
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2400x380+40+80', '-resize', '1200x', 'public/assets/menu_art/raw_fest.png'], check=True)
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2400x360+40+490', '-resize', '1200x', 'public/assets/menu_art/raw_lineup.png'], check=True)
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2400x380+40+870', '-resize', '1200x', 'public/assets/menu_art/raw_billet.png'], check=True)
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2400x380+40+1270', '-resize', '1200x', 'public/assets/menu_art/raw_archives.png'], check=True)

print("Crops generated successfully.")
