import subprocess

def get_column_ink(png_path):
    dim = subprocess.check_output(['identify', '-format', '%wx%h', png_path]).decode().strip()
    w, h = [int(x) for x in dim.split('x')]
    rgb = subprocess.check_output(['convert', png_path, '-depth', '8', 'rgb:-'])
    col_ink = [0]*w
    for x in range(w):
        ink = 0
        for y in range(h):
            idx = (y * w + x) * 3
            r, g, b = rgb[idx], rgb[idx+1], rgb[idx+2]
            darkness = max(max(0, 240-r), max(0, 222-g), max(0, 195-b))
            if darkness > 35:
                ink += 1
        col_ink[x] = ink
    return w, h, col_ink

w, h, cols_billet = get_column_ink('public/assets/menu_art/raw_billet.png')
print("Billet column ink non-zero spans:")
in_letter = False
start = 0
for x in range(w):
    if cols_billet[x] > 5 and not in_letter:
        in_letter = True
        start = x
    elif cols_billet[x] <= 5 and in_letter:
        in_letter = False
        print(f"Letter from {start} to {x} (width {x-start})")
if in_letter:
    print(f"Letter from {start} to {w} (width {w-start})")

w_a, h_a, cols_arch = get_column_ink('public/assets/menu_art/raw_archives.png')
print("Archives column ink non-zero spans:")
in_letter = False
start = 0
for x in range(w_a):
    if cols_arch[x] > 5 and not in_letter:
        in_letter = True
        start = x
    elif cols_arch[x] <= 5 and in_letter:
        in_letter = False
        print(f"Letter from {start} to {x} (width {x-start})")
if in_letter:
    print(f"Letter from {start} to {w_a} (width {w_a-start})")
