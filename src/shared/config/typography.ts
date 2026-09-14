/**
 * 화면 공통 타이포 스케일 (5단계).
 *
 * 상세·온보딩 모두 "상위 제목이 그 안의 라벨·표보다 작고 흐린" 역전이 있었다.
 * (예: 카드 제목 12px medium 안에 표 14px semibold / 스텝 제목 14px 안에 필드 라벨 16px)
 * 크기를 계속 키워 해결하는 대신 규칙 세 가지로 정리한다.
 *
 * 1. 제목은 브랜드 서체(cafe24), 본문은 pretendard — 서체가 위계를 지므로 크기 차이를 벌리지 않는다
 * 2. semibold 는 '값'에만 — 라벨·소제목은 medium
 * 3. 회색은 3단계 — neutral-850(값) / neutral-700(라벨) / neutral-500(메타)
 */
export const TEXT = {
  /** 화면에서 유일한 디스플레이 (개체 이름, 스텝 질문). 24 → 28 → 32 */
  display: 'font-cafe24 text-2xl leading-[1.4] text-neutral-850 tab:text-[1.75rem] pc:text-[2rem]',
  /** 섹션 제목. 18 → 20 */
  section: 'font-cafe24 text-lg leading-[1.4] text-neutral-850 tab:text-xl',
  /** 라벨·소제목 — medium 고정. 14 → 15 → 16 */
  sub: 'text-sm leading-[1.5] font-medium text-neutral-700 tab:text-[0.9375rem] pc:text-base',
  /** 값·표 내용 — semibold 는 여기서만. 15 → 16 */
  body: 'text-[0.9375rem] leading-[1.5] font-semibold text-neutral-850 tab:text-base',
  /** 소개글·안내문 같은 긴 서술문 — 값이 아니라 읽는 글이라 medium + 낮은 대비 */
  prose:
    'text-[0.9375rem] leading-[1.5] font-medium whitespace-pre-wrap text-neutral-700 tab:text-base',
  /** 브레드크럼·날짜·보조 설명. 13 → 14 */
  meta: 'text-[0.8125rem] leading-[1.5] font-medium text-neutral-500 tab:text-sm',
} as const
