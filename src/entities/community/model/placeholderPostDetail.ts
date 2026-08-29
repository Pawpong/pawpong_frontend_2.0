import type { CommunityPostCard, CommunityPostDetail } from '@/shared/types'

/**
 * 목록 카드로 상세의 임시 데이터를 만든다.
 * 피드에서 상세로 들어갈 때 서버 응답을 기다리는 동안 빈 화면 대신 이미 아는 값을 먼저 보여준다.
 * 본문은 카드가 가진 발췌본이고 조회수·댓글 미리보기는 카드에 없어 기본값으로 둔다 —
 * 실제 응답이 오면 전부 교체된다.
 */
const toPlaceholderPostDetail = (card: CommunityPostCard): CommunityPostDetail => ({
  ...card,
  body: card.bodyExcerpt,
  viewCount: 0,
  commentPreview: card.commentPreview ?? [],
})

export { toPlaceholderPostDetail }
