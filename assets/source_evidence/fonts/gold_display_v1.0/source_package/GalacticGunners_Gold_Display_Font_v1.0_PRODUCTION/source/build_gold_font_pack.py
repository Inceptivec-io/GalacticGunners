#!/usr/bin/env python3
"""Build the Galactic Gunners Gold Display production font and frontend pack."""

from __future__ import annotations

import base64
import ctypes
import hashlib
import math
import os
import shutil
import subprocess
import sys
import textwrap
import zipfile
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.ttLib import TTFont
from PIL import Image
from PIL import ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
PACK = ROOT / "GalacticGunners_Gold_Display_Font_v1.0_PRODUCTION"
SOURCE = ROOT / "upload" / "image-edit-target-07549c450deb6e47.png"
REFERENCE = ROOT / "upload" / "gg_logo_primary_words_v002(1).png"

UPM = 1000
CAP = 700
STROKE = 112
DEFAULT_WIDTH = 580

# Coordinates describe original, angular centre-line constructions. The broad,
# mitred strokes intentionally echo the supplied GUNNERS artwork without tracing
# or embedding any third-party font.
S = {
    "A": [[(70, 0), (70, 510), (290, 700), (510, 510), (510, 0)], [(135, 290), (445, 290)]],
    "B": [[(70, 0), (70, 700)], [(70, 650), (400, 650), (505, 550), (505, 430), (410, 350), (70, 350)], [(410, 350), (515, 255), (515, 100), (420, 50), (70, 50)]],
    "C": [[(510, 650), (160, 650), (65, 555), (65, 145), (160, 50), (510, 50)]],
    "D": [[(70, 0), (70, 700)], [(70, 650), (380, 650), (510, 520), (510, 180), (380, 50), (70, 50)]],
    "E": [[(510, 650), (70, 650), (70, 50), (510, 50)], [(70, 350), (430, 350)]],
    "F": [[(70, 0), (70, 650), (510, 650)], [(70, 350), (430, 350)]],
    "G": [[(510, 650), (160, 650), (65, 555), (65, 145), (160, 50), (510, 50), (510, 335), (320, 335)]],
    "H": [[(70, 0), (70, 700)], [(510, 0), (510, 700)], [(70, 350), (510, 350)]],
    "I": [[(80, 650), (500, 650)], [(290, 650), (290, 50)], [(80, 50), (500, 50)]],
    "J": [[(80, 650), (500, 650)], [(430, 650), (430, 145), (335, 50), (140, 50), (70, 120)]],
    "K": [[(70, 0), (70, 700)], [(510, 700), (70, 350), (525, 0)]],
    "L": [[(70, 700), (70, 50), (510, 50)]],
    "M": [[(55, 0), (55, 700), (290, 405), (525, 700), (525, 0)]],
    "N": [[(65, 0), (65, 700), (515, 0), (515, 700)]],
    "O": [[(165, 650), (415, 650), (510, 555), (510, 145), (415, 50), (165, 50), (70, 145), (70, 555), (165, 650)]],
    "P": [[(70, 0), (70, 700)], [(70, 650), (405, 650), (510, 550), (510, 435), (405, 350), (70, 350)]],
    "Q": [[(165, 650), (415, 650), (510, 555), (510, 145), (415, 50), (165, 50), (70, 145), (70, 555), (165, 650)], [(330, 215), (545, -35)]],
    "R": [[(70, 0), (70, 700)], [(70, 650), (405, 650), (510, 550), (510, 435), (405, 350), (70, 350)], [(330, 350), (535, 0)]],
    "S": [[(510, 650), (155, 650), (65, 560), (65, 430), (155, 350), (420, 350), (515, 265), (515, 140), (420, 50), (70, 50)]],
    "T": [[(45, 650), (535, 650)], [(290, 650), (290, 0)]],
    "U": [[(65, 700), (65, 150), (165, 50), (415, 50), (515, 150), (515, 700)]],
    "V": [[(55, 700), (290, 45), (525, 700)]],
    "W": [[(45, 700), (145, 45), (290, 330), (435, 45), (535, 700)]],
    "X": [[(60, 700), (520, 0)], [(520, 700), (60, 0)]],
    "Y": [[(55, 700), (290, 350), (525, 700)], [(290, 350), (290, 0)]],
    "Z": [[(60, 650), (520, 650), (60, 50), (520, 50)]],
    "0": [[(165, 650), (415, 650), (510, 555), (510, 145), (415, 50), (165, 50), (70, 145), (70, 555), (165, 650)], [(145, 90), (440, 610)]],
    "1": [[(180, 520), (290, 650), (290, 50)], [(135, 50), (445, 50)]],
    "2": [[(70, 555), (165, 650), (420, 650), (510, 560), (510, 445), (70, 50), (520, 50)]],
    "3": [[(70, 650), (420, 650), (510, 560), (510, 430), (420, 350), (510, 270), (510, 140), (420, 50), (70, 50)], [(250, 350), (420, 350)]],
    "4": [[(450, 0), (450, 700)], [(450, 650), (70, 235), (520, 235)]],
    "5": [[(510, 650), (80, 650), (80, 350), (420, 350), (510, 270), (510, 135), (420, 50), (70, 50)]],
    "6": [[(485, 650), (175, 650), (70, 545), (70, 145), (165, 50), (415, 50), (510, 145), (510, 270), (415, 350), (70, 350)]],
    "7": [[(55, 650), (525, 650), (220, 0)]],
    "8": [[(165, 650), (415, 650), (510, 555), (510, 440), (420, 350), (510, 260), (510, 145), (415, 50), (165, 50), (70, 145), (70, 260), (160, 350), (70, 440), (70, 555), (165, 650)], [(160, 350), (420, 350)]],
    "9": [[(510, 350), (165, 350), (70, 430), (70, 555), (165, 650), (415, 650), (510, 555), (510, 155), (415, 50), (95, 50)]],
}

EXTRA = {
    "hyphen": [[(130, 350), (450, 350)]],
    "underscore": [[(70, 0), (510, 0)]],
    "plus": [[(120, 350), (460, 350)], [(290, 520), (290, 180)]],
    "equal": [[(120, 440), (460, 440)], [(120, 260), (460, 260)]],
    "slash": [[(90, 0), (490, 700)]],
    "backslash": [[(90, 700), (490, 0)]],
    "bar": [[(290, -80), (290, 760)]],
    "exclam": [[(290, 700), (290, 205)], [(290, 80), (290, 45)]],
    "question": [[(80, 555), (175, 650), (410, 650), (505, 555), (505, 445), (290, 285), (290, 205)], [(290, 80), (290, 45)]],
    "colon": [[(290, 490), (290, 455)], [(290, 175), (290, 140)]],
    "semicolon": [[(290, 490), (290, 455)], [(310, 175), (260, 30)]],
    "period": [[(290, 80), (290, 45)]],
    "comma": [[(310, 80), (250, -70)]],
    "parenleft": [[(370, 700), (230, 560), (230, 140), (370, 0)]],
    "parenright": [[(210, 700), (350, 560), (350, 140), (210, 0)]],
    "bracketleft": [[(380, 700), (220, 700), (220, 0), (380, 0)]],
    "bracketright": [[(200, 700), (360, 700), (360, 0), (200, 0)]],
    "less": [[(440, 570), (130, 350), (440, 130)]],
    "greater": [[(140, 570), (450, 350), (140, 130)]],
    "asterisk": [[(290, 570), (290, 250)], [(145, 490), (435, 330)], [(435, 490), (145, 330)]],
    "numbersign": [[(175, 650), (125, 50)], [(455, 650), (405, 50)], [(80, 450), (500, 450)], [(65, 245), (485, 245)]],
    "dollar": S["S"] + [[(290, 760), (290, -60)]],
    "percent": [[(90, 0), (490, 700)], [(145, 600), (145, 525)], [(435, 175), (435, 100)]],
    "ampersand": [[(470, 90), (185, 650), (95, 560), (95, 440), (455, 50)], [(110, 310), (500, 310)]],
    "at": [[(470, 120), (180, 120), (70, 230), (70, 520), (180, 630), (420, 630), (510, 540), (510, 280), (360, 280), (360, 470), (230, 470), (230, 290), (360, 290)]],
    "sterling": [[(430, 600), (330, 650), (200, 590), (200, 50), (500, 50)], [(80, 330), (390, 330)]],
    "Euro": [[(500, 610), (405, 650), (180, 650), (70, 540), (70, 160), (180, 50), (405, 50), (500, 90)], [(45, 430), (390, 430)], [(45, 270), (390, 270)]],
}

CHAR_NAMES = {
    " ": "space", "-": "hyphen", "_": "underscore", "+": "plus", "=": "equal", "/": "slash", "\\": "backslash", "|": "bar",
    "!": "exclam", "?": "question", ":": "colon", ";": "semicolon", ".": "period", ",": "comma", "(": "parenleft", ")": "parenright",
    "[": "bracketleft", "]": "bracketright", "<": "less", ">": "greater", "*": "asterisk", "#": "numbersign", "$": "dollar", "%": "percent",
    "&": "ampersand", "@": "at", "£": "sterling", "€": "Euro",
}

def seg_poly(a, b, width=STROKE):
    x1, y1 = a; x2, y2 = b
    dx, dy = x2-x1, y2-y1
    length = max(math.hypot(dx, dy), 1)
    nx, ny = -dy/length*width/2, dx/length*width/2
    ex, ey = dx/length*width*.12, dy/length*width*.12
    return [(x1-ex+nx, y1-ey+ny), (x2+ex+nx, y2+ey+ny), (x2+ex-nx, y2+ey-ny), (x1-ex-nx, y1-ey-ny)]

def glyph_polys(key):
    paths = S.get(key, EXTRA.get(key, []))
    return [seg_poly(a, b) for path in paths for a, b in zip(path, path[1:])]

def tt_glyph(polys):
    pen = TTGlyphPen(None)
    for poly in polys:
        pen.moveTo(poly[0])
        for p in poly[1:]: pen.lineTo(p)
        pen.closePath()
    return pen.glyph()

def t2_glyph(polys, width=DEFAULT_WIDTH):
    pen = T2CharStringPen(width, None)
    for poly in polys:
        pen.moveTo(poly[0])
        for p in poly[1:]: pen.lineTo(p)
        pen.closePath()
    return pen.getCharString(private=None, globalSubrs=None)

def build_fonts(out):
    glyph_order = [".notdef", "space"] + list(S) + list(EXTRA)
    cmap = {ord(c): c for c in S}
    cmap.update({ord(c.lower()): c for c in S if c.isalpha()})
    cmap.update({ord(ch): name for ch, name in CHAR_NAMES.items()})
    glyphs = {".notdef": tt_glyph([]), "space": tt_glyph([])}
    metrics = {g: (DEFAULT_WIDTH, 0) for g in glyph_order}
    for g in glyph_order[2:]: glyphs[g] = tt_glyph(glyph_polys(g))
    metrics["space"] = (330, 0)

    names = dict(familyName="Galactic Gunners Gold Display", styleName="Regular", uniqueFontIdentifier="Inceptivec:GalacticGunnersGoldDisplay:v1.0", fullName="Galactic Gunners Gold Display Regular", psName="GalacticGunnersGoldDisplay-Regular", version="Version 1.000")
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(glyph_order); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=820, descent=-180); fb.setupNameTable(names); fb.setupOS2(sTypoAscender=820, sTypoDescender=-180, usWinAscent=850, usWinDescent=200, sxHeight=700, sCapHeight=700, usWeightClass=800, usWidthClass=6)
    fb.setupPost(); fb.setupMaxp(); fb.setupHead(created=0, modified=0)
    fea = """feature kern { pos A V -45; pos A W -35; pos A Y -45; pos G U -20; pos L T -30; pos L Y -35; pos R S -18; pos T A -35; pos T O -20; pos Y A -45; } kern;"""
    addOpenTypeFeaturesFromString(fb.font, fea)
    ttf = out / "desktop" / "GalacticGunnersGoldDisplay-Regular.ttf"; fb.save(ttf)

    # Valid CFF-flavoured OpenType desktop font.
    charstrings = {".notdef": t2_glyph([]), "space": t2_glyph([], 330)}
    charstrings.update({g: t2_glyph(glyph_polys(g)) for g in glyph_order[2:]})
    fo = FontBuilder(UPM, isTTF=False)
    fo.setupGlyphOrder(glyph_order); fo.setupCharacterMap(cmap); fo.setupHorizontalMetrics(metrics); fo.setupHorizontalHeader(ascent=820, descent=-180)
    fo.setupNameTable(names); fo.setupOS2(sTypoAscender=820, sTypoDescender=-180, usWinAscent=850, usWinDescent=200, sxHeight=700, sCapHeight=700, usWeightClass=800, usWidthClass=6)
    fo.setupPost(); fo.setupCFF(names["psName"], {"FullName": names["fullName"], "FamilyName": names["familyName"], "Weight": "Bold", "version": "1.000"}, charstrings, {})
    otf = out / "desktop" / "GalacticGunnersGoldDisplay-Regular.otf"; fo.save(otf)

    # WOFF works natively. WOFF2 uses a tiny ctypes bridge to the system Brotli library.
    wf = TTFont(ttf); wf.flavor = "woff"; wf.save(out / "web" / "GalacticGunnersGoldDisplay-Regular.woff")
    return ttf

def install_brotli_bridge():
    bridge = ROOT / "brotli.py"
    bridge.write_text('''import ctypes\nMODE_GENERIC=0\nMODE_TEXT=1\nMODE_FONT=2\nL=ctypes.CDLL("libbrotlienc.so.1"); D=ctypes.CDLL("libbrotlidec.so.1")\nL.BrotliEncoderMaxCompressedSize.argtypes=[ctypes.c_size_t]; L.BrotliEncoderMaxCompressedSize.restype=ctypes.c_size_t\nL.BrotliEncoderCompress.argtypes=[ctypes.c_int,ctypes.c_int,ctypes.c_int,ctypes.c_size_t,ctypes.c_void_p,ctypes.POINTER(ctypes.c_size_t),ctypes.c_void_p]\ndef compress(data,mode=0,quality=11,lgwin=22,lgblock=0):\n n=L.BrotliEncoderMaxCompressedSize(len(data)); out=ctypes.create_string_buffer(n); s=ctypes.c_size_t(n); inp=ctypes.create_string_buffer(data); ok=L.BrotliEncoderCompress(quality,lgwin,mode,len(data),inp,ctypes.byref(s),out);\n if not ok: raise RuntimeError("Brotli compression failed")\n return out.raw[:s.value]\ndef decompress(data):\n size=max(len(data)*8,1024)\n while size<268435456:\n  out=ctypes.create_string_buffer(size); s=ctypes.c_size_t(size); inp=ctypes.create_string_buffer(data); r=D.BrotliDecoderDecompress(len(data),inp,ctypes.byref(s),out)\n  if r==1:return out.raw[:s.value]\n  if r!=3:raise RuntimeError("Brotli decompression failed")\n  size*=2\n raise RuntimeError("Brotli output too large")\n''')
    sys.path.insert(0, str(ROOT))

def path_d(text, size=1.0, tracking=55):
    x = 0; pieces=[]
    for ch in text:
        key = ch.upper() if ch.upper() in S else CHAR_NAMES.get(ch)
        if key:
            for poly in glyph_polys(key):
                pts = [(x+px*size, py*size) for px,py in poly]
                pieces.append("M"+" ".join(f"{a:.1f},{-b:.1f}" for a,b in pts)+"Z")
        x += (330 if ch == " " else DEFAULT_WIDTH)*size + tracking*size
    return " ".join(pieces), x

def cinematic_svg(text, width=3840, height=1500):
    d, natural = path_d(text, 1.0, 30)
    scale = min((width-340)/natural, (height-380)/800)
    tx=(width-natural*scale)/2; ty=height*.72
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<defs>
 <linearGradient id="extrude" x2="0" y2="1"><stop stop-color="#5b1608"/><stop offset=".45" stop-color="#250603"/><stop offset="1" stop-color="#090101"/></linearGradient>
 <linearGradient id="gold" x2="0" y2="1"><stop stop-color="#fff2a2"/><stop offset=".08" stop-color="#ffd53e"/><stop offset=".28" stop-color="#ff9c00"/><stop offset=".48" stop-color="#ffe16a"/><stop offset=".65" stop-color="#e84b00"/><stop offset=".84" stop-color="#ffb000"/><stop offset="1" stop-color="#701400"/></linearGradient>
 <linearGradient id="bevel" x2="1" y2="1"><stop stop-color="#fffbd2"/><stop offset=".25" stop-color="#ffbf18"/><stop offset=".52" stop-color="#7f1700"/><stop offset=".75" stop-color="#ff7b00"/><stop offset="1" stop-color="#250301"/></linearGradient>
 <pattern id="grain" width="53" height="41" patternUnits="userSpaceOnUse"><path d="M3 8l16-3M29 17l20-4M9 32l13-2M35 36l11-2" stroke="#fff6a0" stroke-opacity=".17" stroke-width="2"/></pattern>
 <filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feGaussianBlur stdDeviation="18"/><feColorMatrix values="1 0 0 0 .45 0 .25 0 0 .02 0 0 0 0 0 0 0 0 .9 0"/></filter>
 <filter id="glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="100%" height="100%" fill="none"/>
<g transform="translate({tx:.2f} {ty:.2f}) scale({scale:.6f})">
 <path d="{d}" transform="translate(44 62)" fill="#160200" opacity=".88"/>
 <path d="{d}" transform="translate(36 46)" fill="url(#extrude)" stroke="#150100" stroke-width="42" stroke-linejoin="miter" paint-order="stroke fill"/>
 <path d="{d}" transform="translate(24 30)" fill="#5e1000" stroke="#ff4a00" stroke-opacity=".5" stroke-width="24" stroke-linejoin="miter" paint-order="stroke fill"/>
 <path d="{d}" fill="url(#bevel)" stroke="#3a0600" stroke-width="46" stroke-linejoin="miter" paint-order="stroke fill"/>
 <path d="{d}" fill="url(#gold)" stroke="#ffcb37" stroke-width="22" stroke-linejoin="miter" paint-order="stroke fill" filter="url(#glow)"/>
 <path d="{d}" fill="url(#grain)" stroke="#fff2a2" stroke-opacity=".5" stroke-width="7" stroke-linejoin="miter" paint-order="stroke fill"/>
</g></svg>'''

def specimen_svg():
    rows=["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "0123456789", "GUNNERS  GALACTIC", "!? #$%&@ €£ +-= /\\"]
    body=[]
    y=500
    for i,row in enumerate(rows):
        d,n=path_d(row,1,28); scale=min(1.0,3350/n)
        body.append(f'<path d="{d}" transform="translate(245 {y}) scale({scale})" fill="url(#gold)" stroke="#ffdc58" stroke-width="9" paint-order="stroke fill"/>')
        y+=340 if i<2 else 310
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#120502"/><stop offset="1" stop-color="#030101"/></linearGradient><linearGradient id="gold" x2="0" y2="1"><stop stop-color="#fff1a0"/><stop offset=".2" stop-color="#ffbd20"/><stop offset=".55" stop-color="#f06a00"/><stop offset=".8" stop-color="#ffb000"/><stop offset="1" stop-color="#6b1000"/></linearGradient></defs><rect width="3840" height="2160" fill="url(#bg)"/><text x="190" y="180" fill="#f7ad17" font-family="sans-serif" font-size="72" font-weight="700">GALACTIC GUNNERS GOLD DISPLAY — GLYPH PROOF v1.0</text><path d="M190 220H3650" stroke="#8f3105" stroke-width="4"/>{''.join(body)}</svg>'''

def clean_selected_reference(src, dst):
    im=Image.open(src).convert("RGBA")
    px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            mx=max(r,g,b); mn=min(r,g,b); sat=mx-mn
            # Generated checkerboard consists of very light neutral greys.
            if sat < 10 and mn > 225:
                px[x,y]=(r,g,b,0)
            elif sat < 22 and mn > 205:
                alpha=max(0,min(255,int((225-mn)*12)))
                px[x,y]=(r,g,b,alpha)
    bbox=im.getbbox()
    if bbox: im=im.crop(bbox)
    canvas=Image.new("RGBA",(3840,1296),(0,0,0,0))
    scale=min(3680/im.width,1136/im.height)
    im=im.resize((max(1,int(im.width*scale)),max(1,int(im.height*scale))),Image.Resampling.LANCZOS)
    canvas.alpha_composite(im,((3840-im.width)//2,(1296-im.height)//2))
    canvas.save(dst,optimize=True)

def write_files(ttf):
    web=PACK/"web"; docs=PACK/"documentation"; cine=PACK/"cinematic"; proof=PACK/"specimens"; src=PACK/"source"
    # WOFF2 after bridge module becomes visible to fontTools.
    install_brotli_bridge()
    sys.modules.pop("brotli",None)
    import brotli  # noqa
    w2=TTFont(ttf); w2.flavor="woff2"; w2.save(web/"GalacticGunnersGoldDisplay-Regular.woff2")
    css='''@font-face {\n  font-family: "Galactic Gunners Gold Display";\n  src: url("./GalacticGunnersGoldDisplay-Regular.woff2") format("woff2"),\n       url("./GalacticGunnersGoldDisplay-Regular.woff") format("woff");\n  font-style: normal; font-weight: 400 900; font-display: swap;\n}\n.gg-gold { font-family: "Galactic Gunners Gold Display", sans-serif; text-transform: uppercase; letter-spacing: .045em; color: #ffb000; }\n.gg-gold-cinematic { font-family: "Galactic Gunners Gold Display", sans-serif; text-transform: uppercase; letter-spacing: .035em; color: transparent; background: linear-gradient(180deg,#fff3a6 0%,#ffc42b 18%,#f06b00 53%,#ffd34d 72%,#7d1600 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-stroke:1px #ffcc3a; filter:drop-shadow(0 5px 0 #541000) drop-shadow(0 10px 0 #230300) drop-shadow(0 14px 16px rgba(0,0,0,.75)); }\n'''
    (web/"galactic-gunners-gold.css").write_text(css)
    b64=base64.b64encode((web/"GalacticGunnersGoldDisplay-Regular.woff2").read_bytes()).decode()
    demo=f'''<!doctype html><meta charset="utf-8"><title>Galactic Gunners Gold Display</title><style>@font-face{{font-family:GG;src:url(data:font/woff2;base64,{b64}) format('woff2')}}body{{margin:0;background:radial-gradient(circle at 50% 20%,#281005,#020101 62%);color:#fff;font-family:system-ui;padding:5vw}}h1{{font:clamp(56px,12vw,190px)/.9 GG;letter-spacing:.035em;color:transparent;background:linear-gradient(#fff3a6,#ffb514 23%,#ec5900 58%,#ffd750 74%,#6c1000);background-clip:text;-webkit-background-clip:text;-webkit-text-stroke:2px #ffca31;filter:drop-shadow(0 8px 0 #581000) drop-shadow(0 15px 0 #210300) drop-shadow(0 25px 24px #000)}}p{{font:36px GG;letter-spacing:.08em;color:#f6aa17}}</style><h1>GUNNERS</h1><p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p><p>0123456789 !? € £</p>'''
    (web/"demo.html").write_text(demo)
    (cine/"gg_gold_cinematic_GUNNERS.svg").write_text(cinematic_svg("GUNNERS"))
    (proof/"gg_gold_full_glyph_proof_4k.svg").write_text(specimen_svg())
    proof_img=Image.new("RGB",(3840,2160),(10,2,1)); draw=ImageDraw.Draw(proof_img)
    title_font=ImageFont.truetype(str(ttf),92); glyph_font=ImageFont.truetype(str(ttf),210)
    draw.text((150,90),"GALACTIC GUNNERS GOLD DISPLAY — INSTALLED FONT PROOF",font=title_font,fill=(255,177,25))
    rows=["ABCDEFGHIJKLM","NOPQRSTUVWXYZ","0123456789","GUNNERS  GALACTIC","!?  #$%&@  €£  +-=  /\\"]
    y=320
    for row in rows:
        draw.text((150,y),row,font=glyph_font,fill=(255,170,15),stroke_width=2,stroke_fill=(255,221,93)); y+=340
    proof_img.save(proof/"gg_gold_installed_font_proof_4k.png",optimize=True)
    clean_selected_reference(SOURCE, cine/"gg_gold_GUNNERS_reference_4k_transparent.png")
    shutil.copy2(REFERENCE, src/"authoritative_logo_reference.png")
    shutil.copy2(SOURCE, src/"selected_gold_treatment_reference.png")
    shutil.copy2(ROOT/"build_gold_font_pack.py", src/"build_gold_font_pack.py")
    readme='''# Galactic Gunners Gold Display v1.0\n\n+An original angular industrial display type system derived from the supplied Galactic Gunners gold-word visual language. The installable font contains clean monochrome outlines; the gold, bevel, extrusion and glow are supplied as scalable frontend/rendering treatments.\n\n+## Coverage\n+\n+- A–Z uppercase\n+- a–z mapped deliberately to display capitals\n+- 0–9\n+- core punctuation, operators, €, £, $, %, &, @\n+- OpenType kerning for prominent display pairs\n+\n+## Use\n+\n+- Install `desktop/*.otf` or `desktop/*.ttf`.\n+- Copy `web/*` into the frontend and import `galactic-gunners-gold.css`.\n+- Use `.gg-gold` for reliable UI text and `.gg-gold-cinematic` for enhanced live headings.\n+- Use `cinematic/gg_gold_cinematic_GUNNERS.svg` for the scalable hero-title treatment.\n+\n+The 4K transparent PNG is a production reference/rendered title asset; it is not the font itself. Do not use cinematic glow for body text.\n+'''
    (PACK/"README.md").write_text(readme)
    (docs/"IMPLEMENTATION.md").write_text('''# Frontend implementation\n\n+```css\n+@import url('/fonts/galactic-gunners-gold.css');\n+```\n+\n+```html\n+<h1 class="gg-gold-cinematic">GUNNERS</h1>\n+```\n+\n+For title screens, prefer the supplied cinematic SVG or transparent 4K render. For dynamic scores, menus and accessible live headings, use the WOFF2 font. Keep a semantic text label even where the SVG is displayed.\n+''')
    (docs/"DESIGN_SYSTEM.md").write_text('''# Gold material system\n\n+Face: hot gold alloy (#FFB000)\n+Highlight: pale yellow-gold (#FFF2A2)\n+Mid-bevel: orange (#F06A00)\n+Recess: oxide red (#6B1000)\n+Extrusion: brown-black (#210400)\n+\n+Construction uses broad angular strokes, clipped terminals and sharp mitred joins. Cinematic treatment is deliberately separated from glyph outlines so lettering remains searchable, selectable and scalable in the frontend.\n+''')
    (docs/"LICENSE.md").write_text('''# Asset licence\n\n+Prepared as an original commissioned type and rendering pack for the Galactic Gunners project from user-supplied visual references. No third-party font files are included. Project owners may use, modify, embed and redistribute these files with the Galactic Gunners software and associated marketing.\n+''')

def validate_and_render():
    subprocess.run(["inkscape",str(PACK/"cinematic/gg_gold_cinematic_GUNNERS.svg"),"--export-type=png","--export-filename="+str(PACK/"cinematic/gg_gold_cinematic_GUNNERS_4k.png")],check=True,stdout=subprocess.DEVNULL)
    subprocess.run(["inkscape",str(PACK/"specimens/gg_gold_full_glyph_proof_4k.svg"),"--export-type=png","--export-filename="+str(PACK/"specimens/gg_gold_full_glyph_proof_4k.png")],check=True,stdout=subprocess.DEVNULL)
    report=[]
    for font_path in sorted((PACK/"desktop").iterdir()):
        f=TTFont(font_path); cmap=f.getBestCmap(); required="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        report.append(f"{font_path.name}: PASS; glyphs={len(f.getGlyphOrder())}; required-map={'PASS' if all(ord(c) in cmap for c in required) else 'FAIL'}")
    for fp in sorted((PACK/"web").glob("*.woff*")):
        f=TTFont(fp); report.append(f"{fp.name}: PASS; flavor={f.flavor}; glyphs={len(f.getGlyphOrder())}")
    (PACK/"documentation/VALIDATION.txt").write_text("\n".join(report)+"\n")
    manifest=[]
    for p in sorted(PACK.rglob("*")):
        if p.is_file() and p.name!="SHA256SUMS.txt": manifest.append(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(PACK).as_posix()}")
    (PACK/"SHA256SUMS.txt").write_text("\n".join(manifest)+"\n")

def main():
    if PACK.exists(): shutil.rmtree(PACK)
    for d in ["desktop","web","cinematic","specimens","documentation","source"]: (PACK/d).mkdir(parents=True,exist_ok=True)
    ttf=build_fonts(PACK)
    write_files(ttf)
    validate_and_render()
    zip_path=ROOT/"GalacticGunners_Gold_Display_Font_v1.0_PRODUCTION.zip"
    if zip_path.exists(): zip_path.unlink()
    with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in sorted(PACK.rglob("*")):
            if p.is_file(): z.write(p,Path(PACK.name)/p.relative_to(PACK))
    print(zip_path)
    print(hashlib.sha256(zip_path.read_bytes()).hexdigest())

if __name__=="__main__": main()
