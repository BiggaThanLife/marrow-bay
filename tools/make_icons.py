"""Draws the Marrow Bay app icon (MB monogram over a night skyline and tide) and writes the sizes the page uses.
Run only if the design changes:  python tools/make_icons.py   (needs Pillow)"""
import pathlib, random
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
S = 1024                       # draw big, shrink for clean edges
BG_TOP, BG_BOT = (16, 32, 42), (26, 47, 60)
TEAL, TEAL_DK = (79, 209, 181), (15, 143, 124)
INK, AMBER = (230, 239, 233), (242, 184, 75)

img = Image.new('RGB', (S, S))
d = ImageDraw.Draw(img)
for y in range(S):             # night sky gradient
    t = y / S
    d.line([(0, y), (S, y)], fill=tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3)))

# moon
sky = tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * (150 / S)) for i in range(3))
d.ellipse([775, 95, 875, 195], fill=(214, 226, 222))
d.ellipse([805, 83, 905, 183], fill=sky)

# skyline, kept inside the central safe zone so round and maskable crops still show it
random.seed(7)
bld = [(150, 600), (250, 540), (340, 640), (430, 570), (530, 650), (620, 530), (720, 620), (810, 580)]
base = 760
for i, (x, top) in enumerate(bld):
    w = 100 if i < len(bld) - 1 else 74
    d.rectangle([x, top, x + w, base], fill=(12, 24, 32))
    for wy in range(top + 24, base - 20, 40):
        for wx in range(x + 16, x + w - 16, 30):
            if random.random() < .38:
                d.rectangle([wx, wy, wx + 12, wy + 18], fill=AMBER)

# tide: layered waves over the foot of the city
import math
for k, (y0, col, amp, ph) in enumerate([(740, TEAL_DK, 22, 0.0), (800, TEAL, 20, 1.3), (865, TEAL_DK, 24, 2.1)]):
    pts = [(x, y0 + amp * math.sin(x / 70 + ph)) for x in range(0, S + 1, 8)]
    d.polygon(pts + [(S, S), (0, S)], fill=col)
d.polygon([(x, 905 + 14 * math.sin(x / 55 + 0.6)) for x in range(0, S + 1, 8)] + [(S, S), (0, S)], fill=(12, 24, 32))

# MB monogram
font = ImageFont.truetype('C:/Windows/Fonts/impact.ttf', 400)
txt = 'MB'
bb = d.textbbox((0, 0), txt, font=font)
tw, th = bb[2] - bb[0], bb[3] - bb[1]
tx, ty = (S - tw) // 2 - bb[0], 210 - bb[1]
d.text((tx + 10, ty + 12), txt, font=font, fill=(6, 14, 20))   # shadow
d.text((tx, ty), txt, font=font, fill=INK)
d.rectangle([(S - tw) // 2, ty + th + bb[1] + 22, (S + tw) // 2, ty + th + bb[1] + 34], fill=TEAL)

def out(name, size, flat=True):
    img.resize((size, size), Image.LANCZOS).save(ROOT / name)

out('icon-512.png', 512)
out('icon-192.png', 192)
out('apple-touch-icon.png', 180)
ico = img.resize((256, 256), Image.LANCZOS)
ico.save(ROOT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('icons written')
