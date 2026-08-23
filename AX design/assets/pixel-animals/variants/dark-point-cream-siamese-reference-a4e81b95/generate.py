from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, Iterable, List, Set, Tuple

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
SOURCE_PATH = Path(
    "/Users/choi_eun_jin/Desktop/pawpong_frontend_2.0/AX design/assets/"
    "pixel-animals/canonical/pawpong-cat-base-100x95.svg"
)
SVG_PATH = ROOT / "pawpong-cat-dark-point-cream-siamese.svg"
PREVIEW_155_PATH = ROOT / "pawpong-cat-dark-point-cream-siamese-preview-155.png"
PREVIEW_620_PATH = ROOT / "pawpong-cat-dark-point-cream-siamese-preview-620.png"

CANVAS = 155
CELL = 5
ART_X = 25
ART_Y = 30

OUTLINE = "#AD651D"
BODY = "#F5EADF"
HIGHLIGHT = "#FDF4DF"
POINT_DARK = "#231406"
POINT_MID = "#45280C"
DETAIL = "#683D11"

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

Pixel = Tuple[int, int]
SpanMap = Dict[int, List[Tuple[int, int]]]

SOURCE_MAP = [
    "......OOOO....OOOO..",
    "......OHBOO..OOBHO..",
    "......OHBBOOOOBBHO..",
    "......OHBBBOOBBBHO..",
    ".....OOBBBBBBBBBBOO.",
    ".....OBBBBBBBBBBBBO.",
    ".....OBBBBBBBBBBBBO.",
    "OOO.OBBBBBBBBBBBBBBO",
    "OBO..OHHBBDBBBBDBHO.",
    "OBO.OBBBBBBWWDWWBBBO",
    "OBO..OHHBBWWDWDWWHO.",
    "OBBOOOOBBWWWWWWWWOO.",
    "OOBBBBBBBBBBBBBOOO..",
    ".OOBBBBBBBBBBBBO....",
    "..OBBBBBBBBBBBBO....",
    "..OBBBBBBBBBBBBO....",
    "..OBBBBBBBBBBBBO....",
    "..OBBOOOBBOOOBBO....",
    "..OOOO.OOOO.OOOO....",
]
FUR_CELLS: Set[Pixel] = {
    (x, y)
    for y, row in enumerate(SOURCE_MAP)
    for x, value in enumerate(row)
    if value == "B"
}


def cells(spans: SpanMap) -> Set[Pixel]:
    return {
        (x, y)
        for y, ranges in spans.items()
        for start, end in ranges
        for x in range(start, end + 1)
    }


POINT_CELLS = cells(
    {
        1: [(8, 8), (15, 15)],
        2: [(8, 9), (14, 15)],
        3: [(8, 10), (13, 15)],
        4: [(8, 15)],
        5: [(7, 16)],
        6: [(7, 16)],
        7: [(6, 17)],
        8: [(1, 1), (8, 16)],
        9: [(1, 1), (5, 10), (16, 18)],
        10: [(1, 1), (8, 9)],
        11: [(1, 2)],
        12: [(2, 4)],
        15: [(3, 4), (8, 9), (13, 14)],
        16: [(3, 4), (8, 9), (13, 14)],
        17: [(3, 4), (8, 9), (13, 14)],
    }
) & FUR_CELLS


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
            output.append(recolor(element, DETAIL, "eye"))
        elif index in NOSE_MOUTH_SOURCE_INDICES:
            output.append(recolor(element, DETAIL, "nose-mouth"))
        elif source_color in {SOURCE_BODY, SOURCE_SHADOW}:
            output.append(recolor(element, BODY, "base-coat"))
        elif source_color == OUTLINE:
            output.append(recolor(element, OUTLINE, "outline"))
        elif source_color == DETAIL:
            output.append(recolor(element, DETAIL, "face-detail"))
        elif source_color == "#FFFFFF":
            output.append(recolor(element, POINT_MID, "muzzle"))
        elif source_color == SOURCE_HIGHLIGHT:
            raise ValueError(f"Unclassified source highlight path at index {index}")
        else:
            raise ValueError(f"Unexpected source color {source_color} at index {index}")
    return output


def horizontal_runs(points: Iterable[Pixel]) -> List[Tuple[int, int, int]]:
    rows: Dict[int, List[int]] = {}
    for x, y in points:
        rows.setdefault(y, []).append(x)
    runs: List[Tuple[int, int, int]] = []
    for y in sorted(rows):
        xs = sorted(set(rows[y]))
        start = previous = xs[0]
        for x in xs[1:]:
            if x == previous + 1:
                previous = x
                continue
            runs.append((start, y, previous - start + 1))
            start = previous = x
        runs.append((start, y, previous - start + 1))
    return runs


def point_layer() -> str:
    lines = [
        f'    <g id="siamese-points" data-role="coat-pattern" fill="{POINT_DARK}" '
        f'style="fill:{POINT_DARK};fill-opacity:1;">'
    ]
    for x, y, width in horizontal_runs(POINT_CELLS):
        lines.append(
            f'      <rect x="{x * CELL}" y="{y * CELL}" '
            f'width="{width * CELL}" height="{CELL}"/>'
        )
    lines.append("    </g>")
    return "\n".join(lines)


def build_svg(paths: List[str]) -> str:
    layer = "\n".join(f"    {item}" for item in paths)
    return f'''<svg width="155" height="155" viewBox="0 0 155 155" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <title>포퐁 크림 다크포인트 샴 고양이</title>
  <desc>공식 원형을 유지하고 크림색 몸과 짙은 갈색 얼굴·귀·꼬리·발 포인트를 적용한 픽셀 고양이</desc>
  <g id="pawpong-dark-point-cream-siamese-cat" transform="translate(25 30)" data-grid-cell="5" data-artwork-grid="20x19" data-source-path-count="136">
{layer}
{point_layer()}
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
    for x, y in POINT_CELLS:
        x0 = (ART_X + x * CELL) * scale
        y0 = (ART_Y + y * CELL) * scale
        draw.rectangle(
            (x0, y0, x0 + CELL * scale - 1, y0 + CELL * scale - 1),
            fill=POINT_DARK,
        )
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
