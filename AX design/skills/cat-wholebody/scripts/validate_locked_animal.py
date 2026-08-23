#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


CELL = 5
EXPECTED_PATHS = 136
NUMBER_RE = re.compile(r"-?\d+(?:\.\d+)?")


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def snap_number(raw: str) -> str:
    value = float(raw)
    snapped = round(value / CELL) * CELL
    if abs(value - snapped) > 1.2:
        raise ValueError(f"5px grid 밖의 값: {value}")
    return str(int(snapped))


def normalized_d(value: str) -> str:
    return NUMBER_RE.sub(lambda match: snap_number(match.group(0)), value)


def fill_of(element: ET.Element) -> str:
    return element.attrib.get("fill", "").upper()


def fail(messages: list[str]) -> None:
    for message in messages:
        print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def validate(args: argparse.Namespace) -> None:
    source_root = ET.parse(args.source).getroot()
    candidate_root = ET.parse(args.candidate).getroot()
    errors: list[str] = []

    if candidate_root.attrib.get("width") != "155":
        errors.append('candidate width가 "155"가 아님')
    if candidate_root.attrib.get("height") != "155":
        errors.append('candidate height가 "155"가 아님')
    if candidate_root.attrib.get("viewBox") != "0 0 155 155":
        errors.append('candidate viewBox가 "0 0 155 155"가 아님')
    if candidate_root.attrib.get("shape-rendering") != "crispEdges":
        errors.append('shape-rendering="crispEdges"가 없음')

    candidate_groups = [el for el in candidate_root.iter() if local_name(el.tag) == "g"]
    art_groups = [el for el in candidate_groups if el.attrib.get("transform") == "translate(25 30)"]
    if len(art_groups) != 1:
        errors.append('transform="translate(25 30)"인 원형 그룹이 정확히 하나가 아님')

    source_paths = [el for el in source_root.iter() if local_name(el.tag) == "path"]
    candidate_paths = [el for el in candidate_root.iter() if local_name(el.tag) == "path"]
    if len(source_paths) != EXPECTED_PATHS:
        errors.append(f"공식 원형 path가 {EXPECTED_PATHS}개가 아님: {len(source_paths)}")
    if len(candidate_paths) != EXPECTED_PATHS:
        errors.append(f"candidate path가 {EXPECTED_PATHS}개가 아님: {len(candidate_paths)}")

    if len(source_paths) == len(candidate_paths) == EXPECTED_PATHS:
        for index, (source, candidate) in enumerate(zip(source_paths, candidate_paths)):
            try:
                source_d = normalized_d(source.attrib.get("d", ""))
                candidate_d = normalized_d(candidate.attrib.get("d", ""))
            except ValueError as exc:
                errors.append(f"path {index}: {exc}")
                continue
            if source_d != candidate_d:
                errors.append(f"path {index}의 원형 기하 또는 순서가 변경됨")

    outline = args.outline_color.upper()
    detail = args.detail_color.upper()
    outline_paths = [el for el in candidate_paths if el.attrib.get("data-role") == "outline"]
    if not outline_paths:
        errors.append('data-role="outline" path가 없음')
    for element in outline_paths:
        if fill_of(element) != outline:
            errors.append(f"outline path 색상이 {outline}가 아님")

    eye_paths = [el for el in candidate_paths if el.attrib.get("data-role") == "eye"]
    if len(eye_paths) not in {0, 2}:
        errors.append(f"눈 path는 기본 face-detail 또는 eye 2개여야 함: {len(eye_paths)}")
    nose_mouth = [el for el in candidate_paths if el.attrib.get("data-role") == "nose-mouth"]
    if len(nose_mouth) not in {0, 3}:
        errors.append(f"nose-mouth path는 3개여야 함: {len(nose_mouth)}")
    for element in nose_mouth:
        if fill_of(element) != detail:
            errors.append(f"코·입 path 색상이 {detail}가 아님")

    for element in candidate_root.iter():
        role = element.attrib.get("data-role", "").lower()
        if "eye" in role and local_name(element.tag) != "path":
            errors.append("눈 색 변경용 신규 group/rect/overlay가 존재함")
        if local_name(element.tag) in {"linearGradient", "radialGradient", "filter"}:
            errors.append(f"금지된 SVG 효과가 존재함: {local_name(element.tag)}")
        if "stroke" in element.attrib and element.attrib["stroke"].lower() not in {"", "none"}:
            errors.append("안티앨리어싱 stroke가 존재함")

    direct_rects = [el for el in list(candidate_root) if local_name(el.tag) == "rect"]
    if direct_rects:
        errors.append("투명 배경을 가리는 최상위 rect가 존재함")

    if errors:
        fail(errors)

    print("PASS: Pawpong 원형 잠금 검증 완료")
    print(f"paths={len(candidate_paths)} outline_paths={len(outline_paths)} eye_paths={len(eye_paths)} nose_mouth_paths={len(nose_mouth)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="포퐁 픽셀 동물 원형 잠금 SVG 검증")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--candidate", type=Path, required=True)
    parser.add_argument("--outline-color", required=True)
    parser.add_argument("--detail-color", required=True)
    validate(parser.parse_args())


if __name__ == "__main__":
    main()
