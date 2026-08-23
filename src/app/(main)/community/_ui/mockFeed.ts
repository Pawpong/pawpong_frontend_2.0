import type { CommunityPostCard, CommunityPostDetail } from '@/shared/types'

/**
 * 최은진: 신규 파일 — 백엔드 없이 로컬에서 피드 스크롤 UI를 확인하기 위한 목업 데이터.
 * CommunityContent에서 API 호출이 실패하거나(백엔드 미기동) 빈 목록일 때만,
 * 개발 환경(NODE_ENV !== 'production')에서 폴백으로 사용된다.
 */

/**
 * 로그인 없이도 mock-* 글에 댓글 작성 인터랙션을 미리 볼 수 있게 하는 가짜 "나".
 * CommentSection에서 mock 글에 한해서만 로그인 여부와 무관하게 이 프로필로 댓글을 단다.
 */
export const MOCK_ME = {
  userId: 'mock-me',
  nickname: '나(미리보기)',
  profileImageUrl: undefined,
  role: 'adopter' as const,
}
export const MOCK_COMMUNITY_FEED: CommunityPostCard[] = [
  {
    postId: 'mock-1',
    authorId: 'mock-author-1',
    authorModel: 'Breeder',
    authorNickname: '파이리귀여워',
    authorProfileImageUrl: undefined,
    bodyExcerpt: '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포켓몬 파이리랑 똑같이 생겼죠!?',
    primaryPhotoUrl: '/images/mock-pet.jpg',
    photoUrls: ['/images/mock-pet.jpg', '/images/mock-pet.jpg', '/images/mock-pet.jpg'],
    petType: 'reptile',
    category: '레오파드',
    visibility: 'public',
    status: 'published',
    likeCount: 10,
    commentCount: 10,
    saveCount: 2,
    isLiked: false,
    isSaved: false,
    createdAt: '20시간 전',
  },
  {
    postId: 'mock-2',
    authorId: 'mock-author-2',
    authorModel: 'Adopter',
    authorNickname: '골든집사',
    authorProfileImageUrl: undefined,
    bodyExcerpt:
      '분양 3주차 육아 일지 남겨요. 처음엔 사료를 안 먹어서 걱정했는데 지금은 손에서 잘 받아먹어요. 산책 데뷔는 다음주부터 시작할 예정입니다. 같은 시기에 입양하신 분들 계시면 정보 공유해요!',
    primaryPhotoUrl: undefined,
    photoUrls: [],
    petType: 'dog',
    category: '골든리트리버',
    visibility: 'public',
    status: 'published',
    likeCount: 24,
    commentCount: 6,
    saveCount: 4,
    isLiked: false,
    isSaved: false,
    createdAt: '1일 전',
  },
  {
    postId: 'mock-3',
    authorId: 'mock-author-3',
    authorModel: 'Adopter',
    authorNickname: '냥집사은지',
    authorProfileImageUrl: undefined,
    bodyExcerpt: '창가 자리 뺏겼습니다 오늘도... 낮잠 삼매경',
    primaryPhotoUrl: '/images/mock-pet.jpg',
    photoUrls: ['/images/mock-pet.jpg'],
    petType: 'cat',
    category: '스코티시폴드',
    visibility: 'public',
    status: 'published',
    likeCount: 41,
    commentCount: 3,
    saveCount: 8,
    isLiked: true,
    isSaved: true,
    createdAt: '2일 전',
  },
  {
    postId: 'mock-4',
    authorId: 'mock-author-4',
    authorModel: 'Breeder',
    authorNickname: '비숑브리더',
    authorProfileImageUrl: undefined,
    bodyExcerpt: '새로 태어난 아이들 건강검진 다녀왔어요, 다들 몸무게 잘 늘고 있습니다',
    primaryPhotoUrl: '/images/mock-pet.jpg',
    photoUrls: ['/images/mock-pet.jpg', '/images/mock-pet.jpg'],
    petType: 'dog',
    category: '비숑',
    visibility: 'public',
    status: 'published',
    likeCount: 18,
    commentCount: 5,
    saveCount: 3,
    isLiked: false,
    isSaved: false,
    createdAt: '3일 전',
  },
]

/**
 * 목업 게시글의 상세 버전. 댓글 아이콘 클릭 → 상세 모달로 진입했을 때(PostDetailContent)
 * 실제 API가 없는 mock-* 글이어도 헤더·이미지·본문이 비어 보이지 않도록 카드 데이터를 상세 형태로 확장한다.
 * 댓글 목록(CommentSection)까지는 흉내내지 않는다 — 그건 이 요청의 범위 밖.
 */
export const getMockPostDetail = (postId: string): CommunityPostDetail | undefined => {
  const card = MOCK_COMMUNITY_FEED.find((post) => post.postId === postId)
  if (!card) return undefined

  return {
    postId: card.postId,
    authorId: card.authorId,
    authorModel: card.authorModel,
    authorNickname: card.authorNickname,
    authorProfileImageUrl: card.authorProfileImageUrl,
    title: card.title,
    body: card.bodyExcerpt,
    photoUrls: card.photoUrls,
    petType: card.petType,
    category: card.category,
    visibility: card.visibility,
    status: card.status,
    likeCount: card.likeCount,
    commentCount: card.commentCount,
    saveCount: card.saveCount,
    viewCount: 128,
    createdAt: card.createdAt,
    commentPreview: [],
    isLiked: card.isLiked,
    isSaved: card.isSaved,
  }
}
