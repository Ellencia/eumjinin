"""src/assets/*.webp → src/assets/thumbs/<이름>.webp (가로 800px, q75). 사진 추가 후 한 번 실행하고 결과를 커밋.
    python make_thumbs.py
"""
import glob, os
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), 'src', 'assets')
OUT = os.path.join(SRC, 'thumbs')
WIDTH = 800
os.makedirs(OUT, exist_ok=True)

for path in glob.glob(os.path.join(SRC, '*.webp')):
    name = os.path.basename(path)
    im = Image.open(path)
    im.thumbnail((WIDTH, WIDTH * 10))  # 가로 기준, 비율 유지
    im.save(os.path.join(OUT, name), 'WEBP', quality=75)
    print(f'{name}: {os.path.getsize(path) // 1024} KB -> {os.path.getsize(os.path.join(OUT, name)) // 1024} KB {im.size}')
