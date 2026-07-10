"""Generates 1200x630 OGP images for dev-sim-lab pages.

Design tokens mirror assets/common.css so social-preview cards match the
site's visual language. Usage:

    python scripts/generate-ogp.py index --title "開発あるある図鑑" \\
        --subtitle "ソフトウェア開発の「あるある」を、体験でわかる形に。" \\
        --eyebrow "DEV SIM LAB"
"""

import argparse
import pathlib

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

PAPER = "#EDF1EF"
LINE = "#D3DCD8"
INK = "#22302E"
INK_SOFT = "#5C6B68"
Q, C, D = "#0E7C66", "#B07A14", "#3B6EA5"

FONTS_DIR = pathlib.Path(r"C:\Windows\Fonts")
BOLD_FONT = FONTS_DIR / "meiryob.ttc"
REGULAR_FONT = FONTS_DIR / "meiryo.ttc"

ROOT = pathlib.Path(__file__).resolve().parent.parent


def font(path, size):
    return ImageFont.truetype(str(path), size)


def wrap_text(draw, text, f, max_width):
    lines, current = [], ""
    for ch in text:
        trial = current + ch
        if draw.textlength(trial, font=f) > max_width and current:
            lines.append(current)
            current = ch
        else:
            current = trial
    if current:
        lines.append(current)
    return lines


def draw_grid(draw):
    for x in range(0, W, 28):
        draw.line([(x, 0), (x, H)], fill=LINE, width=1)
    for y in range(0, H, 28):
        draw.line([(0, y), (W, y)], fill=LINE, width=1)


def generate(out_path, eyebrow, title, subtitle):
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)
    draw_grid(draw)

    pad = 84

    eyebrow_font = font(BOLD_FONT, 22)
    draw.text((pad, 64), eyebrow, font=eyebrow_font, fill=INK_SOFT)

    # three accent squares echoing the site's Q/C/D palette
    sq = 14
    sx = pad
    sy = 64 + 40
    for i, color in enumerate((Q, C, D)):
        draw.rectangle([sx + i * (sq + 10), sy, sx + i * (sq + 10) + sq, sy + sq], fill=color)

    title_font = font(BOLD_FONT, 64)
    title_lines = wrap_text(draw, title, title_font, W - pad * 2)
    ty = 230
    for line in title_lines:
        draw.text((pad, ty), line, font=title_font, fill=INK)
        ty += 78

    subtitle_font = font(REGULAR_FONT, 30)
    subtitle_lines = wrap_text(draw, subtitle, subtitle_font, W - pad * 2)
    sy2 = ty + 18
    for line in subtitle_lines[:2]:
        draw.text((pad, sy2), line, font=subtitle_font, fill=INK_SOFT)
        sy2 += 42

    url_font = font(REGULAR_FONT, 22)
    draw.text((pad, H - 64), "sakuichi.github.io/dev-sim-lab", font=url_font, fill=INK_SOFT)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG")
    print(f"wrote {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", help="output filename stem, e.g. 'index'")
    parser.add_argument("--eyebrow", default="DEV SIM LAB")
    parser.add_argument("--title", required=True)
    parser.add_argument("--subtitle", required=True)
    args = parser.parse_args()

    out = ROOT / "assets" / "ogp" / f"{args.slug}.png"
    generate(out, args.eyebrow, args.title, args.subtitle)
