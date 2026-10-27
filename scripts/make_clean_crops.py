import subprocess

# 1. First recreate repaged crops from original JPEG
# Image is 2476x1696
# FESTIVAL: y=80..460
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2476x380+0+80', '+repage', 'public/assets/menu_art/raw_fest.png'], check=True)
# LINE-UP: y=480..850
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2476x370+0+480', '+repage', 'public/assets/menu_art/raw_lineup.png'], check=True)
# BILLET: y=860..1240
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2476x380+0+860', '+repage', 'public/assets/menu_art/raw_billet.png'], check=True)
# ARCHIVES: y=1250..1650
subprocess.run(['convert', 'public/assets/aistudio/IMG_5320_4b28c10f.jpeg', '-crop', '2476x390+0+1250', '+repage', 'public/assets/menu_art/raw_archives.png'], check=True)

print("Repaged crops created successfully!")
