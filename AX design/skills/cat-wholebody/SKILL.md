---
name: cat-wholebody
description: 포퐁의 공식 픽셀 동물 원형을 잠근 채 사진·이미지 레퍼런스에 맞춰 모색, 몸 내부 무늬, 귀 내부, 수염·입 주변 표시, 기존 눈 path 색상만 변경하고 SVG를 검증한다. 포퐁 픽셀 동물, 고양이 원형, 155px SVG, 모색·무늬·눈 색 변형, 기존 캐릭터와 동일한 포즈 요청에 사용한다. 왕관·하트·별 같은 일반 아이콘, 래스터 이미지, 또는 사용자가 명시적으로 승인한 새 실루엣·새 포즈 탐색에는 사용하지 않는다.
---

# 포퐁 픽셀 동물 원형 잠금

## 기준 파일 찾기

1. 현재 작업 폴더에서 프로젝트 루트를 찾는다.
2. 다음 두 문서를 모두 끝까지 읽는다. `AX design` 구조가 없으면 같은 이름의 `docs/design-system` 파일을 찾는다.
   - `AX design/docs/design-system/PAWPONG_BRAND_HARNESS.md`
   - `AX design/docs/design-system/PAWPONG_PIXEL_ANIMAL_RULES.md`
3. 문서가 지정하는 현재 공식 원형 SVG를 읽는다. 기본 고양이 원형은 `AX design/assets/pixel-animals/canonical/pawpong-cat-base-100x95.svg`다.
4. 문서 또는 공식 원형이 없으면 임의로 재구성하지 말고 중단하여 누락 경로를 보고한다.

## 작업 모드 결정

- 기존 SVG, 동일한 형태, 원형 유지, 포즈 유지, 모색·무늬 변경 요청은 `원형 잠금 변형`으로 선언한다.
- 사진의 자세와 표정은 모색 근거로만 사용한다.
- 사용자가 새 실루엣이나 새 포즈를 명시적으로 요청한 경우 이 Skill의 자동 원형 잠금 제작을 중단하고 별도 승인 범위를 확인한다.

## 원형 잠금 변형

1. 레퍼런스에서 기본 몸색, 무늬, 대비, 귀 내부, 수염·입 주변 표시 여부와 눈 색만 추출한다.
2. 기존 원형의 path 개수, 순서, `d`, 실루엣, 포즈, 얼굴 위치를 유지한다.
3. 허용된 기존 path의 fill만 변경하고 몸 마스크 안에만 직교형 무늬 rect를 추가한다.
4. 눈 색이 명확하면 규칙 문서가 지정한 상단 두 눈 path의 fill만 변경한다. 눈 overlay, 신규 path 또는 신규 rect를 추가하지 않는다.
5. 코·입 세 path는 규칙 문서의 보호 색상을 유지한다.
6. `155 x 155`, 5px 그리드, `translate(25 30)`, 투명 배경과 `shape-rendering="crispEdges"`를 보존한다.
7. 결과 SVG와 미리보기를 `AX design/assets/pixel-animals/variants/<asset-name>/` 아래에 저장한다.

## 검증

규칙 문서에서 현재 외곽선 색상과 코·입 보호 색상을 읽은 뒤 다음을 실행한다.

```bash
python3 "AX design/skills/cat-wholebody/scripts/validate_locked_animal.py" \
  --source "AX design/assets/pixel-animals/canonical/pawpong-cat-base-100x95.svg" \
  --candidate "<결과 SVG 경로>" \
  --outline-color "<현재 규칙의 외곽선 HEX>" \
  --detail-color "<현재 규칙의 코·입 HEX>"
```

- 검증이 하나라도 실패하면 결과를 완성본으로 전달하지 않는다.
- SVG를 실제 155px와 확대 화면에서 모두 시각 검토한다.
- 사용자 승인 전 공식 서비스 에셋으로 승격하지 않는다.

## 전달

- SVG와 PNG 미리보기의 절대 경로를 제공한다.
- 변경한 허용 속성, 유지한 보호 속성, 검증 결과를 짧게 보고한다.
- 새 형태 요청이 아닌 한 원형을 바꾸지 않았다고 명시한다.
