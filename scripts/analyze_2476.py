import subprocess

for name, path in [
    ('fest', 'public/assets/menu_art/raw_fest.png'),
    ('lineup', 'public/assets/menu_art/raw_lineup.png'),
    ('billet', 'public/assets/menu_art/raw_billet.png'),
    ('archives', 'public/assets/menu_art/raw_archives.png')
]:
    dim = subprocess.check_output(['identify', '-format', '%wx%h', path]).decode().strip()
    w, h = [int(x) for x in dim.split('x')]
    rgb = subprocess.check_output(['convert', path, '-depth', '8', 'rgb:-'])
    
    col_d = []
    for x in range(w):
        col_sum = 0
        for y in range(h):
            idx = (y*w + x)*3
            darkness = max(0, 240 - rgb[idx], 222 - rgb[idx+1], 195 - rgb[idx+2])
            if darkness > 40:
                col_sum += darkness
        col_d.append(col_sum)
    
    max_d = max(col_d)
    ranges = []
    curr = None
    for x in range(w):
        if col_d[x] > max_d * 0.04:
            if curr is None: curr = [x, x]
            else: curr[1] = x
        else:
            if curr:
                ranges.append(curr)
                curr = None
    if curr: ranges.append(curr)
    print(name, w, h, [(s, e, e-s) for s, e in ranges])
