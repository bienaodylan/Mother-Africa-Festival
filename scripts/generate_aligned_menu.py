import subprocess
import os

os.makedirs('public/assets/menu_art', exist_ok=True)

def crop_and_convert(src_path, crop_box, dst_path, target_glyph_h=150, canvas_h=175):
    # 1. Crop cleanly
    cropped_png = subprocess.check_output(['convert', src_path, '-crop', crop_box, '+repage', 'png:-'])
    dim = subprocess.check_output(['identify', '-format', '%wx%h', '-'], input=cropped_png).decode().strip()
    w, h = [int(x) for x in dim.split('x')]
    
    # 2. Get RGB bytes
    rgb_bytes = subprocess.check_output(['convert', '-', '-depth', '8', 'rgb:-'], input=cropped_png)
    out_rgba = bytearray(w * h * 4)
    
    for i in range(w * h):
        r = rgb_bytes[i*3]
        g = rgb_bytes[i*3 + 1]
        b = rgb_bytes[i*3 + 2]
        
        diff_r = max(0, 240 - r)
        diff_g = max(0, 222 - g)
        diff_b = max(0, 195 - b)
        darkness = max(diff_r, diff_g, diff_b)
        
        if darkness < 24:
            alpha = 0
        elif darkness > 58:
            alpha = 255
        else:
            alpha = int(255 * (darkness - 24) / (58 - 24))
            
        out_rgba[i*4] = 244     # #F4F1EA (Blanc crème)
        out_rgba[i*4 + 1] = 241
        out_rgba[i*4 + 2] = 234
        out_rgba[i*4 + 3] = alpha
        
    # 3. Trim outer transparent margins, keeping letter flush left
    p_trim = subprocess.Popen(['convert', '-size', f'{w}x{h}', '-depth', '8', 'rgba:-', '-trim', '+repage', 'png:-'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    trimmed_png, _ = p_trim.communicate(input=out_rgba)
    
    p_id = subprocess.Popen(['identify', '-format', '%wx%h', '-'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    dim_trimmed, _ = p_id.communicate(input=trimmed_png)
    tw, th = [int(x) for x in dim_trimmed.decode().strip().split('x')]
    
    # 4. Normalize glyph height so all words have identical cap-height (equal to LINE-UP)
    scale = target_glyph_h / th
    scaled_w = int(round(tw * scale))
    scaled_h = target_glyph_h
    
    # Pad to canvas_h keeping left edge flush (gravity West)
    cmd = [
        'convert', '-',
        '-resize', f'{scaled_w}x{scaled_h}!',
        '-gravity', 'West',
        '-background', 'none',
        '-extent', f'{scaled_w}x{canvas_h}',
        dst_path
    ]
    p_fin = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    p_fin.communicate(input=trimmed_png)
    print(f"Generated {dst_path}: trimmed={tw}x{th} -> scaled={scaled_w}x{canvas_h} (flush left)")

# 1. LINE-UP: from x=264 to 968 (w=704)
crop_and_convert('public/assets/menu_art/raw_lineup.png', '704x180+264+0', 'public/assets/menu_art/menu_lineup_white.png', 150, 175)

# 2. FESTIVAL: from x=100 to 1090 (w=990)
crop_and_convert('public/assets/menu_art/raw_fest.png', '990x190+100+0', 'public/assets/menu_art/menu_festival_white.png', 150, 175)

# 3. ARCHIVES: from x=141 to 1093 (w=952)
crop_and_convert('public/assets/menu_art/raw_archives.png', '952x190+141+0', 'public/assets/menu_art/menu_archives_white.png', 150, 175)

# 4. BILLETTERIE: assemble letters B, I, L, L, E, T, T, E, R, I, E
letters = [
    ('public/assets/menu_art/raw_billet.png', '166x190+230+0'), # B
    ('public/assets/menu_art/raw_billet.png', '56x190+410+0'),  # I
    ('public/assets/menu_art/raw_billet.png', '120x190+490+0'), # L
    ('public/assets/menu_art/raw_billet.png', '120x190+620+0'), # L
    ('public/assets/menu_art/raw_billet.png', '124x190+750+0'), # E
    ('public/assets/menu_art/raw_billet.png', '135x190+874+0'), # T
    ('public/assets/menu_art/raw_billet.png', '135x190+874+0'), # T
    ('public/assets/menu_art/raw_billet.png', '124x190+750+0'), # E
    ('public/assets/menu_art/raw_archives.png', '110x190+290+0'), # R
    ('public/assets/menu_art/raw_billet.png', '56x190+410+0'),  # I
    ('public/assets/menu_art/raw_billet.png', '124x190+750+0'), # E
]

cmd = ['convert']
for src, box in letters:
    cmd.extend(['(', src, '-crop', box, '+repage', ')'])
cmd.extend(['+append', 'public/assets/menu_art/raw_billetterie_clean.png'])
subprocess.run(cmd, check=True)

dim = subprocess.check_output(['identify', '-format', '%wx%h', 'public/assets/menu_art/raw_billetterie_clean.png']).decode().strip()
bw, bh = [int(x) for x in dim.split('x')]
crop_and_convert('public/assets/menu_art/raw_billetterie_clean.png', f'{bw}x{bh}+0+0', 'public/assets/menu_art/menu_billetterie_white.png', 150, 175)

# Copy to public/ root
subprocess.run('cp public/assets/menu_art/menu_*.png public/', shell=True, check=True)
print("Finished!")
