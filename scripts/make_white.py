import subprocess
import os

def process_image(src, dst):
    dim = subprocess.check_output(['identify', '-format', '%wx%h', src]).decode().strip()
    w, h = [int(x) for x in dim.split('x')]
    
    rgb_bytes = subprocess.check_output(['convert', src, '-depth', '8', 'rgb:-'])
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
            
        out_rgba[i*4] = 244     # #F4F1EA
        out_rgba[i*4 + 1] = 241
        out_rgba[i*4 + 2] = 234
        out_rgba[i*4 + 3] = alpha
        
    p = subprocess.Popen(['convert', '-size', f'{w}x{h}', '-depth', '8', 'rgba:-', '-trim', '+repage', dst], stdin=subprocess.PIPE)
    p.communicate(input=out_rgba)
    dim_out = subprocess.check_output(['identify', '-format', '%wx%h', dst]).decode().strip()
    print(f"Created {dst}: {dim_out}")

process_image('public/assets/menu_art/raw_fest.png', 'public/assets/menu_art/menu_festival_white.png')
process_image('public/assets/menu_art/raw_lineup.png', 'public/assets/menu_art/menu_lineup_white.png')
process_image('public/assets/menu_art/raw_billet.png', 'public/assets/menu_art/menu_billet_white.png')
process_image('public/assets/menu_art/raw_archives.png', 'public/assets/menu_art/menu_archives_white.png')
