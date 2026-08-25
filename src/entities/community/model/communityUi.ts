/** 커뮤니티 화면이 공유하는 표시 상수 — 피드 카드와 상세가 같은 값을 쓴다 */

// [refactored] 피드 카드·상세에 각각 복사돼 있던 캐러셀 오버라이드를 한 곳으로
// (기본값인 흰 점·반투명 검정 화살표 대신 브랜드 옐로우 점 + 불투명 진회색 화살표)
export const COMMUNITY_CAROUSEL_STYLE = {
  buttonClassName: 'size-8 bg-neutral-850/90 hover:bg-neutral-850',
  activeDotClassName: 'h-2 w-5 rounded-full bg-point-500',
  inactiveDotClassName: 'size-2 rounded-full bg-point-500/20',
} as const

// [refactored] 목록·상세에 같은 문자열이 두 번 있던 것을 상수로
export const COMMUNITY_LOGIN_PROMPT = {
  reaction: '로그인하고 마음에 드는 글에 좋아요와 저장을 남겨보세요.',
  comment: '로그인하고 이 글에 댓글을 남겨보세요.',
} as const
