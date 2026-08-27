"""Create transparent, inspectable H014 character derivatives from Founder source sheets."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets' / 'boarding' / 'characters'


def process(kind: str, source_dir: Path, expected: int) -> list[dict[str, object]]:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = []
    for index, source in enumerate(sorted(source_dir.glob('*.png')), start=1):
        image = Image.open(source).convert('RGBA')
        alpha = image.getchannel('A')
        bbox = alpha.getbbox()
        if bbox is None:
            raise RuntimeError(f'Empty source sprite: {source}')
        cropped = image.crop(bbox)
        destination = OUTPUT / f'{kind}_{index:03d}_v001.png'
        cropped.save(destination, optimize=True)
        records.append({
            'source': str(source.relative_to(ROOT)).replace('\\', '/'),
            'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'runtime_derivative': str(destination.relative_to(ROOT)).replace('\\', '/'),
            'runtime_sha256': hashlib.sha256(destination.read_bytes()).hexdigest(),
            'source_size': image.size,
            'alpha_bounds': bbox,
            'derivative_size': cropped.size,
        })
    if len(records) != expected:
        raise RuntimeError(f'{kind} count mismatch: {len(records)} != {expected}')
    return records


metadata = {
    'method': 'RGBA alpha bounds crop; no creative pixel changes; no uniform-cell slicing',
    'player': process('player', ROOT / 'assets' / 'platform' / 'player_platform', 7),
    'alien': process('alien', ROOT / 'assets' / 'platform' / 'alien_platform', 6),
}
(OUTPUT / 'H014_CHARACTER_NORMALIZATION.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
print(f"Normalized {len(metadata['player']) + len(metadata['alien'])} H014 character sheets.")
