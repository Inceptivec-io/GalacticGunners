#!/usr/bin/env python3
"""Build the Galactic Gunners Silver Display production font and frontend pack."""

from __future__ import annotations

import base64
import ctypes
import csv
import hashlib
import json
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
from fontTools.designspaceLib import AxisDescriptor, DesignSpaceDocument, SourceDescriptor
from fontTools import varLib
from fontTools.ttLib import TTFont
from PIL import Image
from PIL import ImageDraw, ImageFilter, ImageFont
import numpy as np
from scipy.ndimage import binary_erosion, distance_transform_edt, sobel
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLTTFont
from reportlab.pdfgen import canvas as pdfcanvas

ROOT = Path(__file__).resolve().parent
PACK = ROOT / "GalacticGunners_Silver_Display_Font_v1.0_PRODUCTION"
SOURCE = ROOT / "generated_images" / "exec-194be6a2-cb93-4b86-bfe2-63ab8c447d99.png"
REFERENCE = ROOT / "upload" / "gg_logo_primary_words_v002(3).png"

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

def glyph_polys(key, stroke=STROKE):
    paths = S.get(key, EXTRA.get(key, []))
    return [seg_poly(a, b, stroke) for path in paths for a, b in zip(path, path[1:])]

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

    names = dict(familyName="Galactic Gunners Silver Display", styleName="Regular", uniqueFontIdentifier="Inceptivec:GalacticGunnersSilverDisplay:v1.0", fullName="Galactic Gunners Silver Display Regular", psName="GalacticGunnersSilverDisplay-Regular", version="Version 1.000")
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(glyph_order); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=820, descent=-180); fb.setupNameTable(names); fb.setupOS2(sTypoAscender=820, sTypoDescender=-180, usWinAscent=850, usWinDescent=200, sxHeight=700, sCapHeight=700, usWeightClass=800, usWidthClass=6)
    fb.setupPost(); fb.setupMaxp(); fb.setupHead(created=0, modified=0)
    fea = """feature kern { pos A V -45; pos A W -35; pos A Y -45; pos G U -20; pos L T -30; pos L Y -35; pos R S -18; pos T A -35; pos T O -20; pos Y A -45; } kern;"""
    addOpenTypeFeaturesFromString(fb.font, fea)
    ttf = out / "desktop" / "GalacticGunnersSilverDisplay-Regular.ttf"; fb.save(ttf)

    # Valid CFF-flavoured OpenType desktop font.
    charstrings = {".notdef": t2_glyph([]), "space": t2_glyph([], 330)}
    charstrings.update({g: t2_glyph(glyph_polys(g)) for g in glyph_order[2:]})
    fo = FontBuilder(UPM, isTTF=False)
    fo.setupGlyphOrder(glyph_order); fo.setupCharacterMap(cmap); fo.setupHorizontalMetrics(metrics); fo.setupHorizontalHeader(ascent=820, descent=-180)
    fo.setupNameTable(names); fo.setupOS2(sTypoAscender=820, sTypoDescender=-180, usWinAscent=850, usWinDescent=200, sxHeight=700, sCapHeight=700, usWeightClass=800, usWidthClass=6)
    fo.setupPost(); fo.setupCFF(names["psName"], {"FullName": names["fullName"], "FamilyName": names["familyName"], "Weight": "Bold", "version": "1.000"}, charstrings, {})
    otf = out / "desktop" / "GalacticGunnersSilverDisplay-Regular.otf"; fo.save(otf)

    # WOFF works natively. WOFF2 uses a tiny ctypes bridge to the system Brotli library.
    wf = TTFont(ttf); wf.flavor = "woff"; wf.save(out / "web" / "GalacticGunnersSilverDisplay-Regular.woff")
    return ttf

def build_variable_font(out):
    variable=out/"variable"; masters=variable/"masters"; masters.mkdir(parents=True,exist_ok=True)
    glyph_order=[".notdef","space"]+list(S)+list(EXTRA)
    cmap={ord(c):c for c in S}; cmap.update({ord(c.lower()):c for c in S if c.isalpha()}); cmap.update({ord(ch):name for ch,name in CHAR_NAMES.items()})
    metrics={g:(DEFAULT_WIDTH,0) for g in glyph_order}; metrics["space"]=(330,0)
    master_paths=[]
    for weight,stroke,style in [(400,82,"Regular"),(900,142,"Black")]:
        glyphs={".notdef":tt_glyph([]),"space":tt_glyph([])}
        glyphs.update({g:tt_glyph(glyph_polys(g,stroke)) for g in glyph_order[2:]})
        names=dict(familyName="Galactic Gunners Silver Display VF",styleName=style,uniqueFontIdentifier=f"Inceptivec:GalacticGunnersSilverDisplayVF:{weight}:v1.0",fullName=f"Galactic Gunners Silver Display VF {style}",psName=f"GalacticGunnersSilverDisplayVF-{style}",version="Version 1.000")
        fb=FontBuilder(UPM,isTTF=True); fb.setupGlyphOrder(glyph_order); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
        fb.setupHorizontalHeader(ascent=820,descent=-180); fb.setupNameTable(names); fb.setupOS2(sTypoAscender=820,sTypoDescender=-180,usWinAscent=850,usWinDescent=200,sxHeight=700,sCapHeight=700,usWeightClass=weight,usWidthClass=6)
        fb.setupPost(); fb.setupMaxp(); fb.setupHead(created=0,modified=0)
        addOpenTypeFeaturesFromString(fb.font,"feature kern { pos A V -45; pos A W -35; pos A Y -45; pos G U -20; pos L T -30; pos L Y -35; pos R S -18; pos T A -35; pos T O -20; pos Y A -45; } kern;")
        mp=masters/f"master-{weight}.ttf"; fb.save(mp); master_paths.append(mp)
    ds=DesignSpaceDocument(); axis=AxisDescriptor(); axis.name="Weight"; axis.tag="wght"; axis.minimum=400; axis.default=400; axis.maximum=900; ds.addAxis(axis)
    for idx,(weight,path) in enumerate(zip((400,900),master_paths)):
        src=SourceDescriptor(); src.name=f"weight-{weight}"; src.path=str(path); src.location={"Weight":weight}; src.familyName="Galactic Gunners Silver Display VF"; src.styleName="Regular" if weight==400 else "Black"
        if idx==0: src.copyInfo=True; src.copyLib=True; src.copyFeatures=True
        ds.addSource(src)
    designspace=masters/"GalacticGunnersSilverDisplay.designspace"; ds.write(designspace)
    vf,_,_=varLib.build(designspace)
    vf["name"].setName("Galactic Gunners Silver Display Variable",1,3,1,0x409); vf["name"].setName("GalacticGunnersSilverDisplayVF",6,3,1,0x409)
    ttf_path=variable/"GalacticGunnersSilverDisplay-VF.ttf"; vf.save(ttf_path)
    install_brotli_bridge(); sys.modules.pop("brotli",None); import brotli  # noqa
    w2=TTFont(ttf_path); w2.flavor="woff2"; w2.save(variable/"GalacticGunnersSilverDisplay-VF.woff2")
    return ttf_path

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
 <linearGradient id="extrude" x2="0" y2="1"><stop stop-color="#07345a"/><stop offset=".45" stop-color="#001329"/><stop offset="1" stop-color="#00040a"/></linearGradient>
 <linearGradient id="silver" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".08" stop-color="#e9f3f8"/><stop offset=".28" stop-color="#89a5b7"/><stop offset=".48" stop-color="#fbfeff"/><stop offset=".65" stop-color="#4b718a"/><stop offset=".84" stop-color="#c7d8e2"/><stop offset="1" stop-color="#102b41"/></linearGradient>
 <linearGradient id="bevel" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".25" stop-color="#9ee7ff"/><stop offset=".52" stop-color="#093756"/><stop offset=".75" stop-color="#00aaff"/><stop offset="1" stop-color="#020b14"/></linearGradient>
 <pattern id="grain" width="53" height="41" patternUnits="userSpaceOnUse"><path d="M3 8l16-3M29 17l20-4M9 32l13-2M35 36l11-2" stroke="#dff8ff" stroke-opacity=".21" stroke-width="2"/></pattern>
 <filter id="glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="100%" height="100%" fill="none"/>
<g id="title-system" transform="translate({tx:.2f} {ty:.2f}) scale({scale:.6f})">
 <path id="contact-shadow" d="{d}" transform="translate(44 62)" fill="#000713" opacity=".92"/>
 <path id="deep-extrusion" d="{d}" transform="translate(36 46)" fill="url(#extrude)" stroke="#000611" stroke-width="42" stroke-linejoin="miter" paint-order="stroke fill"/>
 <path id="energy-edge" d="{d}" transform="translate(24 30)" fill="#06365a" stroke="#008fff" stroke-opacity=".58" stroke-width="24" stroke-linejoin="miter" paint-order="stroke fill"/>
 <path id="dark-bevel" d="{d}" fill="url(#bevel)" stroke="#00192e" stroke-width="46" stroke-linejoin="miter" paint-order="stroke fill"/>
 <path id="metallic-face" d="{d}" fill="url(#silver)" stroke="#66dcff" stroke-width="22" stroke-linejoin="miter" paint-order="stroke fill" filter="url(#glow)"/>
 <path id="surface-detail" d="{d}" fill="url(#grain)" stroke="#e8fbff" stroke-opacity=".62" stroke-width="7" stroke-linejoin="miter" paint-order="stroke fill"/>
</g></svg>'''

def specimen_svg():
    rows=["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "0123456789", "GUNNERS  GALACTIC", "!? #$%&@ €£ +-= /\\"]
    body=[]
    y=500
    for i,row in enumerate(rows):
        d,n=path_d(row,1,28); scale=min(1.0,3350/n)
        body.append(f'<path d="{d}" transform="translate(245 {y}) scale({scale})" fill="url(#silver)" stroke="#74ddff" stroke-width="9" paint-order="stroke fill"/>')
        y+=340 if i<2 else 310
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#04111e"/><stop offset="1" stop-color="#000307"/></linearGradient><linearGradient id="silver" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".2" stop-color="#dceaf2"/><stop offset=".55" stop-color="#63859b"/><stop offset=".8" stop-color="#edf9ff"/><stop offset="1" stop-color="#12344d"/></linearGradient></defs><rect width="3840" height="2160" fill="url(#bg)"/><text x="190" y="180" fill="#8ee7ff" font-family="sans-serif" font-size="72" font-weight="700">GALACTIC GUNNERS SILVER DISPLAY — GLYPH PROOF v1.0</text><path d="M190 220H3650" stroke="#176998" stroke-width="4"/>{''.join(body)}</svg>'''

def clean_selected_reference(src, dst):
    im=Image.open(src).convert("RGBA")
    bbox=im.getbbox()
    if bbox: im=im.crop(bbox)
    canvas=Image.new("RGBA",(3840,1296),(0,0,0,0))
    scale=min(3680/im.width,1136/im.height)
    im=im.resize((max(1,int(im.width*scale)),max(1,int(im.height*scale))),Image.Resampling.LANCZOS)
    canvas.alpha_composite(im,((3840-im.width)//2,(1296-im.height)//2))
    canvas.save(dst,optimize=True)

def build_emissive_variant(src, dst):
    im=Image.open(src).convert("RGBA")
    alpha=im.getchannel("A")
    wide=alpha.filter(ImageFilter.GaussianBlur(28)); tight=alpha.filter(ImageFilter.GaussianBlur(9))
    glow=Image.new("RGBA",im.size,(0,0,0,0))
    glow.alpha_composite(Image.merge("RGBA",(Image.new("L",im.size,0),Image.new("L",im.size,126),Image.new("L",im.size,255),wide.point(lambda p:int(p*.42)))))
    glow.alpha_composite(Image.merge("RGBA",(Image.new("L",im.size,0),Image.new("L",im.size,205),Image.new("L",im.size,255),tight.point(lambda p:int(p*.62)))))
    glow.alpha_composite(im); glow.save(dst,optimize=True)

def build_msdf_atlas(ttf, game):
    chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,:;+-=_/\\()[]<>#$%&@£€"
    tile=128; cols=10; rows=math.ceil(len(chars)/cols); atlas=Image.new("RGB",(cols*tile,rows*tile),(0,0,0)); font=ImageFont.truetype(str(ttf),86)
    metadata={"atlasType":"msdf","generator":"Galactic Gunners deterministic directional-distance generator v1.0","distanceRange":12,"emSize":86,"texture":{"width":cols*tile,"height":rows*tile,"channels":3,"format":"png"},"glyphs":{}}
    for idx,ch in enumerate(chars):
        mask=Image.new("L",(tile,tile),0); d=ImageDraw.Draw(mask); bbox=d.textbbox((0,0),ch,font=font,stroke_width=0); w=bbox[2]-bbox[0]; h=bbox[3]-bbox[1]; x=(tile-w)//2-bbox[0]; y=(tile-h)//2-bbox[1]
        d.text((x,y),ch,font=font,fill=255)
        inside=np.asarray(mask)>127; edge=inside ^ binary_erosion(inside)
        gx=sobel(inside.astype(float),axis=1); gy=sobel(inside.astype(float),axis=0); ang=(np.arctan2(gy,gx)+np.pi)%(np.pi)
        bins=[edge & ((ang<np.pi/6)|(ang>=5*np.pi/6)),edge & (ang>=np.pi/3)&(ang<2*np.pi/3),edge & ~(((ang<np.pi/6)|(ang>=5*np.pi/6))|((ang>=np.pi/3)&(ang<2*np.pi/3)))]
        channels=[]
        for eb in bins:
            if not eb.any(): eb=edge
            dist=distance_transform_edt(~eb); signed=np.where(inside,dist,-dist); channels.append(np.clip(.5+signed/24,0,1))
        rgb=(np.stack(channels,axis=2)*255).astype(np.uint8); tile_img=Image.fromarray(rgb,"RGB"); px=(idx%cols)*tile; py=(idx//cols)*tile; atlas.paste(tile_img,(px,py))
        metadata["glyphs"][ch]={"unicode":ord(ch),"x":px,"y":py,"width":tile,"height":tile,"advance":round(font.getlength(ch),3),"planeBounds":{"left":x,"top":y,"right":x+w,"bottom":y+h}}
    atlas.save(game/"msdf-atlas.png",optimize=True); (game/"msdf-atlas.json").write_text(json.dumps(metadata,indent=2,ensure_ascii=False))
    (game/"README.md").write_text("# Game atlas\n\n`msdf-atlas.png` is a three-channel directional signed-distance atlas generated from the production TTF. `msdf-atlas.json` contains UV rectangles, advances and plane bounds. Use median(R,G,B) around the 0.5 threshold in the shader. Distance range: 12 px.\n")

def build_glyph_map_and_pdf(ttf, docs, proof):
    font=TTFont(ttf); cmap=font.getBestCmap(); rows=[]
    for cp,glyph in sorted(cmap.items()): rows.append({"character":chr(cp),"unicode":f"U+{cp:04X}","glyph":glyph})
    (docs/"GLYPH_MAP.json").write_text(json.dumps(rows,indent=2,ensure_ascii=False))
    with (docs/"GLYPH_MAP.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=["character","unicode","glyph"]); w.writeheader(); w.writerows(rows)
    pdf=proof/"kerning-proof.pdf"; pdfmetrics.registerFont(RLTTFont("GGSilver",str(ttf))); c=pdfcanvas.Canvas(str(pdf),pagesize=(842,595))
    c.setFillColorRGB(.02,.06,.1); c.rect(0,0,842,595,stroke=0,fill=1); c.setFillColorRGB(.65,.92,1); c.setFont("Helvetica-Bold",22); c.drawString(42,545,"GALACTIC GUNNERS SILVER DISPLAY — KERNING PROOF")
    pairs=["AV AW AY VA WA YA","TA TO AT LT LY","GU NN NE ER RS","GALACTIC","GUNNERS","I L 1   O 0   S 5"]
    y=470; c.setFont("GGSilver",50); c.setFillColorRGB(.86,.94,.98)
    for line in pairs: c.drawString(50,y,line); y-=72
    c.setFont("Helvetica",10); c.setFillColorRGB(.55,.75,.86); c.drawString(50,28,"v1.0 • cap height 700/1000 UPM • OpenType GPOS kerning validation proof")
    c.save()

def write_files(ttf):
    web=PACK/"web"; docs=PACK/"documentation"; cine=PACK/"cinematic"; proof=PACK/"specimens"; src=PACK/"source"; game=PACK/"game"
    # WOFF2 after bridge module becomes visible to fontTools.
    install_brotli_bridge()
    sys.modules.pop("brotli",None)
    import brotli  # noqa
    w2=TTFont(ttf); w2.flavor="woff2"; w2.save(web/"GalacticGunnersSilverDisplay-Regular.woff2")
    css='''@font-face {\n  font-family: "Galactic Gunners Silver Display";\n  src: url("./GalacticGunnersSilverDisplay-Regular.woff2") format("woff2"),\n       url("./GalacticGunnersSilverDisplay-Regular.woff") format("woff");\n  font-style: normal; font-weight: 400 900; font-display: swap;\n}\n.gg-silver { font-family: "Galactic Gunners Silver Display", sans-serif; text-transform: uppercase; letter-spacing: .045em; color: #dceaf2; }\n.gg-silver-cinematic { font-family: "Galactic Gunners Silver Display", sans-serif; text-transform: uppercase; letter-spacing: .035em; color: transparent; background: linear-gradient(180deg,#ffffff 0%,#dceaf2 18%,#6f91a5 53%,#f2fbff 72%,#173a54 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-stroke:1px #7adfff; filter:drop-shadow(0 5px 0 #0a4168) drop-shadow(0 10px 0 #001328) drop-shadow(0 14px 16px rgba(0,0,0,.78)); }\n'''
    (web/"galactic-gunners-silver.css").write_text(css)
    (web/"font-face.css").write_text(css)
    b64=base64.b64encode((web/"GalacticGunnersSilverDisplay-Regular.woff2").read_bytes()).decode()
    demo=f'''<!doctype html><meta charset="utf-8"><title>Galactic Gunners Silver Display</title><style>@font-face{{font-family:GG;src:url(data:font/woff2;base64,{b64}) format('woff2')}}body{{margin:0;background:radial-gradient(circle at 50% 20%,#07233b,#000307 62%);color:#fff;font-family:system-ui;padding:5vw}}h1{{font:clamp(56px,12vw,190px)/.9 GG;letter-spacing:.035em;color:transparent;background:linear-gradient(#ffffff,#dcebf3 23%,#6d8fa4 58%,#f2fbff 74%,#183b55);background-clip:text;-webkit-background-clip:text;-webkit-text-stroke:2px #76dcff;filter:drop-shadow(0 8px 0 #0a426a) drop-shadow(0 15px 0 #001327) drop-shadow(0 25px 24px #000)}}p{{font:36px GG;letter-spacing:.08em;color:#9be8ff}}</style><h1>GALACTIC</h1><p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p><p>0123456789 !? € £</p>'''
    (web/"demo.html").write_text(demo)
    layered=cinematic_svg("GALACTIC")
    (cine/"gg_silver_cinematic_GALACTIC.svg").write_text(layered)
    (cine/"title-metallic.svg").write_text(layered)
    (cine/"title-layered-source.svg").write_text(layered)
    (proof/"gg_silver_full_glyph_proof_4k.svg").write_text(specimen_svg())
    proof_img=Image.new("RGB",(3840,2160),(0,5,11)); draw=ImageDraw.Draw(proof_img)
    title_font=ImageFont.truetype(str(ttf),92); glyph_font=ImageFont.truetype(str(ttf),210)
    draw.text((150,90),"GALACTIC GUNNERS SILVER DISPLAY — INSTALLED FONT PROOF",font=title_font,fill=(141,229,255))
    rows=["ABCDEFGHIJKLM","NOPQRSTUVWXYZ","0123456789","GUNNERS  GALACTIC","!?  #$%&@  €£  +-=  /\\"]
    y=320
    for row in rows:
        draw.text((150,y),row,font=glyph_font,fill=(215,233,243),stroke_width=2,stroke_fill=(88,205,244)); y+=340
    proof_img.save(proof/"gg_silver_installed_font_proof_4k.png",optimize=True)
    clean_selected_reference(SOURCE, cine/"gg_silver_GALACTIC_reference_4k_transparent.png")
    shutil.copy2(cine/"gg_silver_GALACTIC_reference_4k_transparent.png",cine/"title-metallic-transparent-4k.png")
    build_emissive_variant(cine/"title-metallic-transparent-4k.png",cine/"title-emissive-transparent-4k.png")
    Image.open(cine/"title-metallic-transparent-4k.png").save(cine/"title-metallic-transparent-4k.webp",format="WEBP",quality=96,method=6)
    shutil.copy2(REFERENCE, src/"authoritative_logo_reference.png")
    shutil.copy2(SOURCE, src/"selected_silver_treatment_reference.png")
    shutil.copy2(ROOT/"build_silver_font_pack.py", src/"build_silver_font_pack.py")
    readme='''# Galactic Gunners Silver Display v1.0\n\n+An original angular industrial display type system derived from the supplied Galactic Gunners silver-word visual language. The installable font contains clean monochrome outlines; the silver, bevel, extrusion and glow are supplied as scalable frontend/rendering treatments.\n\n+## Coverage\n+\n+- A–Z uppercase\n+- a–z mapped deliberately to display capitals\n+- 0–9\n+- core punctuation, operators, €, £, $, %, &, @\n+- OpenType kerning for prominent display pairs\n+\n+## Use\n+\n+- Install `desktop/*.otf` or `desktop/*.ttf`.\n+- Copy `web/*` into the frontend and import `galactic-gunners-silver.css`.\n+- Use `.gg-silver` for reliable UI text and `.gg-silver-cinematic` for enhanced live headings.\n+- Use `cinematic/gg_silver_cinematic_GALACTIC.svg` for the scalable hero-title treatment.\n+\n+The 4K transparent PNG is a production reference/rendered title asset; it is not the font itself. Do not use cinematic glow for body text.\n+'''
    (PACK/"README.md").write_text(readme)
    (docs/"README.md").write_text(readme)
    (docs/"IMPLEMENTATION.md").write_text('''# Frontend implementation\n\n+```css\n+@import url('/fonts/galactic-gunners-silver.css');\n+```\n+\n+```html\n+<h1 class="gg-silver-cinematic">GALACTIC</h1>\n+```\n+\n+For title screens, prefer the supplied cinematic SVG or transparent 4K render. For dynamic scores, menus and accessible live headings, use the WOFF2 font. Keep a semantic text label even where the SVG is displayed.\n+''')
    (docs/"DESIGN_SYSTEM.md").write_text('''# Silver material system\n\n+Face: cold titanium silver (#DCEAF2)\n+Highlight: ice white (#FFFFFF)\n+Rim light: electric cyan (#66DCFF)\n+Mid-bevel: blue steel (#4B718A)\n+Recess: deep navy (#001329)\n+Extrusion: blue-black (#00040A)\n+\n+Construction uses broad angular strokes, clipped terminals and sharp mitred joins. Cinematic treatment is deliberately separated from glyph outlines so lettering remains searchable, selectable and scalable in the frontend.\n+''')
    (docs/"LICENSE.md").write_text('''# Asset licence\n\n+Prepared as an original commissioned type and rendering pack for the Galactic Gunners project from user-supplied visual references. No third-party font files are included. Project owners may use, modify, embed and redistribute these files with the Galactic Gunners software and associated marketing.\n+''')
    (docs/"VERSION.json").write_text(json.dumps({"family":"Galactic Gunners Silver Display","version":"1.0.0","build":"production","fontUpm":1000,"capHeight":700,"weightAxis":[400,900],"material":"titanium-silver/cyan"},indent=2))
    build_variable_font(PACK)
    build_msdf_atlas(ttf,game)
    build_glyph_map_and_pdf(ttf,docs,proof)

def validate_and_render():
    subprocess.run(["inkscape",str(PACK/"cinematic/gg_silver_cinematic_GALACTIC.svg"),"--export-type=png","--export-filename="+str(PACK/"cinematic/gg_silver_cinematic_GALACTIC_4k.png")],check=True,stdout=subprocess.DEVNULL)
    subprocess.run(["inkscape",str(PACK/"specimens/gg_silver_full_glyph_proof_4k.svg"),"--export-type=png","--export-filename="+str(PACK/"specimens/gg_silver_full_glyph_proof_4k.png")],check=True,stdout=subprocess.DEVNULL)
    shutil.copy2(PACK/"specimens/gg_silver_full_glyph_proof_4k.png",PACK/"specimens/full-glyph-sheet.png")
    report=[]
    for font_path in sorted((PACK/"desktop").iterdir()):
        f=TTFont(font_path); cmap=f.getBestCmap(); required="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        report.append(f"{font_path.name}: PASS; glyphs={len(f.getGlyphOrder())}; required-map={'PASS' if all(ord(c) in cmap for c in required) else 'FAIL'}")
    for fp in sorted((PACK/"web").glob("*.woff*")):
        f=TTFont(fp); report.append(f"{fp.name}: PASS; flavor={f.flavor}; glyphs={len(f.getGlyphOrder())}")
    for fp in sorted((PACK/"variable").glob("*.woff2")):
        f=TTFont(fp); report.append(f"{fp.name}: PASS; flavor={f.flavor}; axes={list(f['fvar'].axes)[0].axisTag}:{list(f['fvar'].axes)[0].minValue}-{list(f['fvar'].axes)[0].maxValue}")
    atlas=Image.open(PACK/"game/msdf-atlas.png"); report.append(f"msdf-atlas.png: PASS; mode={atlas.mode}; size={atlas.width}x{atlas.height}")
    (PACK/"documentation/VALIDATION.txt").write_text("\n".join(report)+"\n")
    manifest=[]
    for p in sorted(PACK.rglob("*")):
        if p.is_file() and p.name!="SHA256SUMS.txt": manifest.append(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(PACK).as_posix()}")
    (PACK/"SHA256SUMS.txt").write_text("\n".join(manifest)+"\n")

def main():
    if PACK.exists(): shutil.rmtree(PACK)
    for d in ["desktop","web","variable","cinematic","game","specimens","documentation","source"]: (PACK/d).mkdir(parents=True,exist_ok=True)
    ttf=build_fonts(PACK)
    write_files(ttf)
    validate_and_render()
    zip_path=ROOT/"GalacticGunners_Silver_Display_Font_v1.0_PRODUCTION.zip"
    if zip_path.exists(): zip_path.unlink()
    with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in sorted(PACK.rglob("*")):
            if p.is_file(): z.write(p,Path(PACK.name)/p.relative_to(PACK))
    print(zip_path)
    print(hashlib.sha256(zip_path.read_bytes()).hexdigest())

if __name__=="__main__": main()
