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
    nickname: string
    avatarUrl: string | null
  }
  createdAt: string
  description: string
  images: string[]
  likeCount: number
  commentCount: number
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

export const MOCK_FAVORITE_BREEDERS: FavoriteBreeder[] = Array.from(
  { length: 2 },
  (_, i) => ({
    ...FAVORITE_BREEDER_BASE,
    id: String(i + 1),
  }),
)

export const MOCK_MY_HOME_POSTS: MyHomePost[] = [
  {
    id: '1',
    author: {
      nickname: '파이리귀여워',
      avatarUrl: null,
    },
    createdAt: '20시간',
    description:
      '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
    images: [
      '/images/placeholder-1.jpg',
      '/images/placeholder-2.jpg',
      '/images/placeholder-3.jpg',
    ],
    likeCount: 10,
    commentCount: 10,
  },
  {
    id: '2',
    author: {
      nickname: '파이리귀여워',
      avatarUrl: null,
    },
    createdAt: '20시간',
    description:
      '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
    images: [
      '/images/placeholder-1.jpg',
      '/images/placeholder-2.jpg',
      '/images/placeholder-3.jpg',
    ],
    likeCount: 10,
    commentCount: 10,
  },
  {
    id: '3',
    author: {
      nickname: '파이리귀여워',
      avatarUrl: null,
    },
    createdAt: '20시간',
    description:
      '너무 이쁜 아이가 태어났어요~ 이름은 파이리!! 포캣몬 파이리랑 똑같이 생겼죠!?',
    images: [
      '/images/placeholder-1.jpg',
      '/images/placeholder-2.jpg',
      '/images/placeholder-3.jpg',
    ],
    likeCount: 10,
    commentCount: 10,
  },
]
