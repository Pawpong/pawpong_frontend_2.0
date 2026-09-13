/**
 * 분양 상세 타이포 스케일 (5단계).
 *
 * 이전에는 카드 제목이 12px medium #5d5d5d 인데 그 안의 표가 14px semibold 라
 * 상위 제목이 하위 항목보다 작고 흐린 역전이 있었고, 이름·값·표·소제목이 전부
 * semibold 라 굵기가 위계 신호로 작동하지 않았다.
 *
 * 규칙 세 가지로 정리한다.
 * 1. 제목은 브랜드 서체(cafe24), 본문은 pretendard — 서체가 위계를 지므로 크기 차이를 벌리지 않는다
 * 2. semibold 는 '값'에만 — 라벨·소제목은 medium
 * 3. 회색은 3단계 — neutral-850(값) / neutral-700(라벨) / neutral-500(메타)
 */
export const DETAIL_TYPE = {
  /** 개체 이름 — 페이지에서 유일한 디스플레이. 24 → 28 → 32 */
  display: 'font-cafe24 text-2xl leading-[1.4] text-neutral-850 tab:text-[1.75rem] pc:text-[2rem]',
  /** 섹션 제목. 18 → 20 */
  section: 'font-cafe24 text-lg leading-[1.4] text-neutral-850 tab:text-xl',
  /** 라벨·소제목 — medium 고정. 14 → 15 → 16 */
  sub: 'text-sm leading-[1.5] font-medium text-neutral-700 tab:text-[0.9375rem] pc:text-base',
  /** 값·표 내용 — semibold 는 여기서만. 15 → 16 */
  body: 'text-[0.9375rem] leading-[1.5] font-semibold text-neutral-850 tab:text-base',
  /** 소개글·사육환경 설명 같은 긴 서술문 — 값이 아니라 읽는 글이라 medium + 낮은 대비 */
  prose:
    'text-[0.9375rem] leading-[1.5] font-medium whitespace-pre-wrap text-neutral-700 tab:text-base',
  /** 브레드크럼·검사기관·날짜. 13 → 14 */
  meta: 'text-[0.8125rem] leading-[1.5] font-medium text-neutral-500 tab:text-sm',
} as const

/** 부모·사육환경 사진 그리드 — 컬럼 폭에 맞춰 열이 늘어난다 (최소 152px) */
export const PHOTO_GRID_COLS = 'grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))]'
