import type { ContestEntry, ContestInfo } from '@/shared/types'

export const MOCK_CONTEST_INFO: ContestInfo = {
  title: '이번달 명예의 전당 주인공이 되어보세요 !',
  participantCount: 120,
  dateRange: '4.26 ~ 5.2',
}

const CONTEST_ENTRY_BASE: ContestEntry = {
  entryId: '1',
  imageUrl: '/images/mock-pet.jpg',
  description:
    '내용을 작성해주세요내용을 작성해주세요내용을 작성해주세요내용을 작성해주세요',
  participant: {
    name: '참여자 이름',
    profileImageUrl: '',
  },
  voteCount: 0,
  isVoted: false,
}

export const MOCK_RANKING_ENTRIES: ContestEntry[] = [
  { ...CONTEST_ENTRY_BASE, entryId: '1', rank: 1, voteCount: 42 },
  { ...CONTEST_ENTRY_BASE, entryId: '2', rank: 2, voteCount: 38 },
  { ...CONTEST_ENTRY_BASE, entryId: '3', rank: 3, voteCount: 31 },
]

export const MOCK_VOTE_ENTRIES: ContestEntry[] = Array.from(
  { length: 9 },
  (_, i) => ({
    ...CONTEST_ENTRY_BASE,
    entryId: String(i + 4),
    voteCount: i === 2 ? 20 : 0,
    isVoted: i === 2,
  }),
)
