/**
 * 스텝 레이아웃 치수 — 스텝마다 제각각이던 값을 한곳으로 모은다.
 *
 * 이전: 본문 폭이 기본 650px 인데 켄넬 단계만 655.5px, 필드 묶음 간격이
 * gap-4 / gap-5 / gap-8 / gap-[3.625rem] 로 스텝마다 달랐다.
 */
export const STEP_LAYOUT = {
  /** 본문 최대 폭 — 모든 스텝 공통 */
  content: 'w-full max-w-[40.625rem]',
  /** 블록(설명 ↔ 입력 묶음 ↔ 부가영역) 사이 */
  blockGap: 'gap-8 tab:gap-12',
  /** 한 묶음 안 필드끼리 */
  fieldGap: 'gap-5',
} as const
