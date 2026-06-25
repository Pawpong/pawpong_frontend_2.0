export interface MyHomeProfile {
  nickname: string
  bio: string
  avatarUrl: string | null
  badges: string[]
  bpm: number
  followerCount: number
  pawprintIcons: number
}

export interface MyHomePost {
  id: string
  author: {
    userId: string
    nickname: string
    avatarUrl: string | null
  }
  createdAt: string
  description: string
  images: string[]
  likeCount: number
  commentCount: number
}

// [refactored] MyHomePost → 공통 PostCard(@/entities/community) props 매핑
// (PostList·SavedFeedsTab 공용. PostCard를 import하지 않고 구조적 호환만 사용 → 역방향 import 없음)
export const toPostCardProps = (post: MyHomePost) => ({
  author: {
    id: post.author.userId,
    nickname: post.author.nickname,
    profileImageUrl: post.author.avatarUrl ?? undefined,
  },
  createdAt: post.createdAt,
  text: post.description,
  images: post.images,
  likeCount: post.likeCount,
  commentCount: post.commentCount,
  detailHref: `/community/${post.id}`,
})

export const MOCK_MY_HOME_PROFILE: MyHomeProfile = {
  nickname: '파이리귀여워',
  bio: '안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면 안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면 ',
  avatarUrl: null,
  badges: ['초보집사', '50 BPM'],
  bpm: 50,
  followerCount: 100,
  pawprintIcons: 3,
}

export interface FavoriteBreeder {
  id: string
  nickname: string
  imageUrl: string | null
  badges: string[]
  isBreeding: boolean
  location: string
  date: string
}

const FAVORITE_BREEDER_BASE: Omit<FavoriteBreeder, 'id'> = {
  nickname: '도심속 도마뱀사장님',
  imageUrl: null,
  badges: ['초보집사', '50 BPM'],
  isBreeding: true,
  location: '마곡동',
  date: '2026.4.30',
}

export const MOCK_FAVORITE_BREEDERS: FavoriteBreeder[] = Array.from({ length: 2 }, (_, i) => ({
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

export const MOCK_MY_HOME_POSTS: MyHomePost[] = [
  {
    id: '1',
    author: {
      userId: 'user-1',
      nickname: '파이리귀여워',
      avatarUrl: null,
    },
    createdAt: '20시간',
    description: '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
    images: ['/images/mock-pet.jpg', '/images/mock-pet.jpg', '/images/mock-pet.jpg'],
    likeCount: 10,
    commentCount: 10,
  },
  {
    id: '2',
    author: {
      userId: 'user-1',
      nickname: '파이리귀여워',
      avatarUrl: null,
    },
    createdAt: '20시간',
    description: '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
    images: ['/images/mock-pet.jpg', '/images/mock-pet.jpg', '/images/mock-pet.jpg'],
    likeCount: 10,
    commentCount: 10,
  },
  {
    id: '3',
    author: {
      userId: 'user-1',
      nickname: '파이리귀여워',
      avatarUrl: null,
    },
    createdAt: '20시간',
    description: '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
    images: ['/images/mock-pet.jpg', '/images/mock-pet.jpg', '/images/mock-pet.jpg'],
    likeCount: 10,
    commentCount: 10,
  },
]
