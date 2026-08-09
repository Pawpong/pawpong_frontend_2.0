import type { CommunityPostCard, FavoriteBreeder } from '@/shared/types'

export interface MyHomeProfile {
  nickname: string
  bio: string
  avatarUrl: string | null
  badges: string[]
  bpm: number
  followerCount: number
  pawprintIcons: number
}

export const MOCK_MY_HOME_PROFILE: MyHomeProfile = {
  nickname: '파이리귀여워',
  bio: '안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면 안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면 ',
  avatarUrl: null,
  badges: ['초보집사', '50 BPM'],
  bpm: 50,
  followerCount: 100,
  pawprintIcons: 3,
}

const FAVORITE_BREEDER_BASE: Omit<FavoriteBreeder, 'id'> = {
  nickname: '도심속 도마뱀사장님',
  imageUrl: '/images/mock-pet.jpg',
  badges: ['초보집사', '50 BPM'],
  isBreeding: true,
  location: '마곡동',
  date: '2026.4.30',
}

export const MOCK_FAVORITE_BREEDERS: FavoriteBreeder[] = Array.from({ length: 8 }, (_, i) => ({
  ...FAVORITE_BREEDER_BASE,
  id: String(i + 1),
}))

export interface BreederProfile extends MyHomeProfile {
  location: string
  isBreeder: true
}

export const MOCK_BREEDER_PROFILE: BreederProfile = {
  nickname: 'CityLizard',
  bio: '안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면 안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면 ',
  avatarUrl: null,
  badges: ['초보집사', '50 BPM'],
  bpm: 50,
  followerCount: 100,
  pawprintIcons: 3,
  location: '사업장 위치를 작성해주세요',
  isBreeder: true,
}

const MY_HOME_POST_BASE: Omit<CommunityPostCard, 'postId'> = {
  authorId: 'user-1',
  authorModel: 'Adopter',
  authorNickname: '파이리귀여워',
  bodyExcerpt: '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
  photoUrls: ['/images/mock-pet.jpg', '/images/mock-pet.jpg', '/images/mock-pet.jpg'],
  visibility: 'public',
  status: 'published',
  likeCount: 10,
  commentCount: 10,
  saveCount: 2,
  createdAt: '20시간',
}

export const MOCK_MY_HOME_POSTS: CommunityPostCard[] = Array.from({ length: 3 }, (_, i) => ({
  ...MY_HOME_POST_BASE,
  postId: String(i + 1),
}))
