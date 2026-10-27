import subprocess

# Let's crop individual letters and compose BILLETTERIE
# In raw_billet.png:
# ornament_left: 140..215
# B: 230..396
# I: 410..466
# L1: 488..612
# L2: 620..744
# E: 750..876
# T: 874..1012
# ornament_right: 1014..1085
# In raw_archives.png:
# R: 288..400

subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '75x190+140+0', '+repage', 'public/assets/menu_art/orn_left.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '170x190+228+0', '+repage', 'public/assets/menu_art/let_b.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '60x190+408+0', '+repage', 'public/assets/menu_art/let_i.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '126x190+486+0', '+repage', 'public/assets/menu_art/let_l1.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '126x190+618+0', '+repage', 'public/assets/menu_art/let_l2.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '128x190+748+0', '+repage', 'public/assets/menu_art/let_e.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '140x190+874+0', '+repage', 'public/assets/menu_art/let_t.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_archives.png', '-crop', '114x190+288+0', '+repage', 'public/assets/menu_art/let_r.png'], check=True)
subprocess.run(['convert', 'public/assets/menu_art/raw_billet.png', '-crop', '75x190+1012+0', '+repage', 'public/assets/menu_art/orn_right.png'], check=True)

# Combine into raw_billetterie.png:
# orn_left + B + I + L1 + L2 + E + T + T + E + R + I + E + orn_right
subprocess.run([
    'convert',
    'public/assets/menu_art/orn_left.png',
    'public/assets/menu_art/let_b.png',
    'public/assets/menu_art/let_i.png',
    'public/assets/menu_art/let_l1.png',
    'public/assets/menu_art/let_l2.png',
    'public/assets/menu_art/let_e.png',
    'public/assets/menu_art/let_t.png',
    'public/assets/menu_art/let_t.png',
    'public/assets/menu_art/let_e.png',
    'public/assets/menu_art/let_r.png',
    'public/assets/menu_art/let_i.png',
    'public/assets/menu_art/let_e.png',
    'public/assets/menu_art/orn_right.png',
    '+append',
    'public/assets/menu_art/raw_billetterie.png'
], check=True)

print("raw_billetterie.png assembled.")
