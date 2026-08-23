from __future__ import annotations

import re
from pathlib import Path
from typing import List

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
SOURCE_PATH = Path(
    "/Users/choi_eun_jin/Desktop/pawpong_frontend_2.0/AX design/assets/"
    "pixel-animals/canonical/pawpong-cat-base-100x95.svg"
)
SVG_PATH = ROOT / "pawpong-cat-solid-gray-green-eyes.svg"
PREVIEW_155_PATH = ROOT / "pawpong-cat-solid-gray-green-eyes-preview-155.png"
PREVIEW_620_PATH = ROOT / "pawpong-cat-solid-gray-green-eyes-preview-620.png"

CANVAS = 155
CELL = 5
ART_X = 25
ART_Y = 30

OUTLINE = "#AD651D"
BODY = "#A6A6A6"
SHADOW = "#6B6B6B"
HIGHLIGHT = "#CACACA"
DETAIL = "#683D11"
EYE = "#8FDCC2"

SOURCE_BODY = "#F8D17D"
SOURCE_SHADOW = "#F6C65D"
SOURCE_HIGHLIGHT = "#FFEBBE"

PATH_RE = re.compile(r"<path\b[^>]*/>")
FILL_RE = re.compile(r'fill="(#[0-9A-Fa-f]{6}|white)"', re.IGNORECASE)
D_RE = re.compile(r'd="([^"]+)"')
NUMBER_RE = re.compile(r"-?\d+(?:\.\d+)?")

EAR_SOURCE_INDICES = {94, 95}
WHISKER_SOURCE_INDICES = {105, 106, 108, 133}
EYE_SOURCE_INDICES = {124, 125}
NOSE_MOUTH_SOURCE_INDICES = {130, 131, 132}


def source_paths() -> List[str]:
    paths = PATH_RE.findall(SOURCE_PATH.read_text(encoding="utf-8"))
    if len(paths) != 136:
        raise ValueError(f"Expected 136 source paths, got {len(paths)}")
    return paths


def fill_of(element: str) -> str:
    match = FILL_RE.search(element)
    if not match:
        raise ValueError(f"Missing fill: {element}")
    color = match.group(1).upper()
    return "#FFFFFF" if color == "WHITE" else color


def snap_path_data(element: str) -> str:
    match = D_RE.search(element)
    if not match:
        raise ValueError(f"Missing path data: {element}")

    def snap_number(number_match: re.Match[str]) -> str:
        value = float(number_match.group(0))
        snapped = round(value / CELL) * CELL
        if abs(value - snapped) > 1.2:
            raise ValueError(f"Unexpected off-grid value {value} in {element}")
        return str(int(snapped))

    snapped_d = NUMBER_RE.sub(snap_number, match.group(1))
    return D_RE.sub(f'd="{snapped_d}"', element, count=1)


def recolor(element: str, color: str, role: str) -> str:
    element = snap_path_data(element)
    element = FILL_RE.sub(f'fill="{color}"', element, count=1)
    element = re.sub(
        r'style="[^"]*"',
        f'style="fill:{color};fill-opacity:1;"',
        element,
        count=1,
    )
    return element.replace("<path ", f'<path data-role="{role}" ', 1)


def candidate_paths() -> List[str]:
    output: List[str] = []
    for index, element in enumerate(source_paths()):
        source_color = fill_of(element)
        if index in EAR_SOURCE_INDICES:
            output.append(recolor(element, HIGHLIGHT, "ear-interior"))
        elif index in WHISKER_SOURCE_INDICES:
            output.append(recolor(element, HIGHLIGHT, "whisker"))
        elif index in EYE_SOURCE_INDICES:
            output.append(recolor(element, EYE, "eye"))
        elif index in NOSE_MOUTH_SOURCE_INDICES:
            output.append(recolor(element, DETAIL, "nose-mouth"))
        elif source_color == SOURCE_BODY:
            output.append(recolor(element, BODY, "base-coat"))
        elif source_color == SOURCE_SHADOW:
            output.append(recolor(element, SHADOW, "coat-shadow"))
        elif source_color == OUTLINE:
            output.append(recolor(element, OUTLINE, "outline"))
        elif source_color == DETAIL:
            output.append(recolor(element, DETAIL, "face-detail"))
        elif source_color == "#FFFFFF":
            output.append(recolor(element, HIGHLIGHT, "muzzle"))
        elif source_color == SOURCE_HIGHLIGHT:
            raise ValueError(f"Unclassified source highlight path at index {index}")
        else:
            raise ValueError(f"Unexpected source color {source_color} at index {index}")
    return output


def build_svg(paths: List[str]) -> str:
    layer = "\n".join(f"    {item}" for item in paths)
    return f'''<svg width="155" height="155" viewBox="0 0 155 155" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <title>포퐁 회색 초록눈 고양이</title>
  <desc>공식 원형을 유지하고 단색 회색 모색과 민트빛 초록 눈을 적용한 픽셀 고양이</desc>
  <g id="pawpong-solid-gray-green-eyed-cat" transform="translate(25 30)" data-grid-cell="5" data-artwork-grid="20x19" data-source-path-count="136">
{layer}
  </g>
</svg>
'''


def render_preview(paths: List[str], scale: int, output_path: Path) -> None:
    image = Image.new("RGBA", (CANVAS * scale, CANVAS * scale), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    for element in paths:
        d_match = D_RE.search(element)
        fill_match = FILL_RE.search(element)
        if not d_match or not fill_match:
            raise ValueError(f"Invalid candidate path: {element}")
        numbers = [float(value) for value in NUMBER_RE.findall(d_match.group(1))]
        xs = numbers[0::2]
        ys = numbers[1::2]
        x0 = int((ART_X + min(xs)) * scale)
        y0 = int((ART_Y + min(ys)) * scale)
        x1 = int((ART_X + max(xs)) * scale) - 1
        y1 = int((ART_Y + max(ys)) * scale) - 1
        draw.rectangle((x0, y0, x1, y1), fill=fill_match.group(1))
    image.save(output_path)


def main() -> None:
    paths = candidate_paths()
    SVG_PATH.write_text(build_svg(paths), encoding="utf-8")
    render_preview(paths, 1, PREVIEW_155_PATH)
    render_preview(paths, 4, PREVIEW_620_PATH)
    print(SVG_PATH)
    print(PREVIEW_155_PATH)
    print(PREVIEW_620_PATH)


if __name__ == "__main__":
    main()
