import type { CommunityPostCard } from '@/shared/types'

const POST_BASE: Omit<CommunityPostCard, 'postId'> = {
  authorId: 'user-1',
  authorModel: 'Breeder',
  authorNickname: '파이리귀여워',
  authorProfileImageUrl: undefined,
  bodyExcerpt:
    '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
  primaryPhotoUrl: '/images/placeholder-1.jpg',
  photoUrls: [
    '/images/placeholder-1.jpg',
    '/images/placeholder-2.jpg',
    '/images/placeholder-3.jpg',
  ],
  petType: 'reptile',
  category: '레오파드',
  likeCount: 10,
  commentCount: 10,
  saveCount: 2,
  createdAt: '20시간',
}

export const MOCK_COMMUNITY_POSTS: CommunityPostCard[] = Array.from(
  { length: 4 },
  (_, i) => ({
    ...POST_BASE,
    postId: `post-${i + 1}`,
  }),
)

export interface CommunityCategory {
  label: string
  value: string
}

export const MOCK_COMMUNITY_CATEGORIES: CommunityCategory[] = [
  { label: '전체', value: '' },
  { label: '강아지', value: '강아지' },
  { label: '비숑', value: '비숑' },
  { label: '고양이', value: '고양이' },
  { label: '스핑크스', value: '스핑크스' },
  { label: '도마뱀', value: '도마뱀' },
  { label: '레오파드', value: '레오파드' },
]
