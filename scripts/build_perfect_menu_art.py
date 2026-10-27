import subprocess
import os

os.makedirs('public/assets/menu_art', exist_ok=True)

def process_word(src, crop_box, dst_name):
    # 1. Crop cleanly
    crop_cmd = ['convert', src, '-crop', crop_box, '+repage', 'png:-']
    cropped_png = subprocess.check_output(crop_cmd)
    
    dim = subprocess.check_output(['identify', '-format', '%wx%h', '-'], input=cropped_png).decode().strip()
    w, h = [int(x) for x in dim.split('x')]
    
    # 2. Extract RGB
    rgb = subprocess.check_output(['convert', '-', '-depth', '8', 'rgb:-'], input=cropped_png)
    out_rgba = bytearray(w * h * 4)
    
    for i in range(w * h):
        r = rgb[i*3]
        g = rgb[i*3 + 1]
        b = rgb[i*3 + 2]
        
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
            
        out_rgba[i*4] = 244     # #F4F1EA
        out_rgba[i*4 + 1] = 241
        out_rgba[i*4 + 2] = 234
        out_rgba[i*4 + 3] = alpha
        
    # Trim transparency
    p_trim = subprocess.Popen(['convert', '-size', f'{w}x{h}', '-depth', '8', 'rgba:-', '-trim', '+repage', 'png:-'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    trimmed_png, _ = p_trim.communicate(input=out_rgba)
    
    p_id = subprocess.Popen(['identify', '-format', '%wx%h', '-'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    dim_trimmed, _ = p_id.communicate(input=trimmed_png)
    tw, th = [int(x) for x in dim_trimmed.decode().strip().split('x')]
    
    # Save trimmed temp
    temp_path = f'public/assets/menu_art/temp_{dst_name}.png'
    with open(temp_path, 'wb') as f:
        f.write(trimmed_png)
    return temp_path, tw, th

# 1. LINE-UP: from x=570 to 1980 (w=1410)
p_lineup, lw, lh = process_word('public/assets/menu_art/raw_lineup.png', '1410x370+570+0', 'lineup')
print(f"LINE-UP trimmed: {lw}x{lh}")

# 2. FESTIVAL: from x=240 to 2260 (w=2020)
p_fest, fw, fh = process_word('public/assets/menu_art/raw_fest.png', '2020x380+240+0', 'fest')
print(f"FESTIVAL trimmed: {fw}x{fh}")

# 3. ARCHIVES: from x=320 to 2235 (w=1915)
p_arch, aw, ah = process_word('public/assets/menu_art/raw_archives.png', '1915x390+320+0', 'arch')
print(f"ARCHIVES trimmed: {aw}x{ah}")

# 4. BILLETTERIE:
# Let's crop clean letters from raw_billet and raw_archives
letters = [
    ('public/assets/menu_art/raw_billet.png', '335x380+500+0'),   # B
    ('public/assets/menu_art/raw_billet.png', '120x380+855+0'),   # I
    ('public/assets/menu_art/raw_billet.png', '250x380+1015+0'),  # L1
    ('public/assets/menu_art/raw_billet.png', '250x380+1275+0'),  # L2
    ('public/assets/menu_art/raw_billet.png', '255x380+1535+0'),  # E
    ('public/assets/menu_art/raw_billet.png', '270x380+1790+0'),  # T
    ('public/assets/menu_art/raw_billet.png', '270x380+1790+0'),  # T
    ('public/assets/menu_art/raw_billet.png', '255x380+1535+0'),  # E
    ('public/assets/menu_art/raw_archives.png', '225x390+615+0'), # R
    ('public/assets/menu_art/raw_billet.png', '120x380+855+0'),   # I
    ('public/assets/menu_art/raw_billet.png', '255x380+1535+0'),  # E
]

cmd = ['convert']
for src, box in letters:
    cmd.extend(['(', src, '-crop', box, '+repage', ')'])
cmd.extend(['+append', 'public/assets/menu_art/raw_billetterie_full.png'])
subprocess.run(cmd, check=True)

dim_b = subprocess.check_output(['identify', '-format', '%wx%h', 'public/assets/menu_art/raw_billetterie_full.png']).decode().strip()
bw, bh = [int(x) for x in dim_b.split('x')]
p_bill, biw, bih = process_word('public/assets/menu_art/raw_billetterie_full.png', f'{bw}x{bh}+0+0', 'billet')
print(f"BILLETTERIE trimmed: {biw}x{bih}")

# Now target height = LINE-UP's trimmed height (lh)
TARGET_H = lh
CANVAS_H = int(round(TARGET_H * 1.15))

print(f"Target glyph height: {TARGET_H}, Canvas height: {CANVAS_H}")

def finalize(temp_path, tw, th, out_name):
    scale = TARGET_H / th
    final_w = int(round(tw * scale))
    final_h = TARGET_H
    dst = f'public/assets/menu_art/{out_name}'
    cmd = [
        'convert', temp_path,
        '-resize', f'{final_w}x{final_h}!',
        '-gravity', 'West',
        '-background', 'none',
        '-extent', f'{final_w}x{CANVAS_H}',
        dst
    ]
    subprocess.run(cmd, check=True)
    dim_out = subprocess.check_output(['identify', '-format', '%wx%h', dst]).decode().strip()
    print(f"Saved {dst}: {dim_out}")

finalize(p_lineup, lw, lh, 'menu_lineup_white.png')
finalize(p_fest, fw, fh, 'menu_festival_white.png')
finalize(p_arch, aw, ah, 'menu_archives_white.png')
finalize(p_bill, biw, bih, 'menu_billetterie_white.png')

# Also duplicate to public/
subprocess.run('cp public/assets/menu_art/menu_*.png public/', shell=True, check=True)
print("ALL DONE!")
