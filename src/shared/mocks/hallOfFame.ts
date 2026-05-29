import type { ContestEntry, ContestInfo } from '@/shared/types'

export const MOCK_CONTEST_INFO: ContestInfo = {
  id: 'mock-contest-1',
  title: '이번달 명예의 전당 주인공이 되어보세요 !',
  description: '콘테스트 설명',
  benefitText: '참여 혜택',
  startDate: '2025-04-26T00:00:00Z',
  endDate: '2025-05-02T23:59:59Z',
  status: 'active',
  participantCount: 120,
}

const CONTEST_ENTRY_BASE: ContestEntry = {
  id: '1',
  userId: 'user-1',
  userDisplayName: '참여자 이름',
  userProfileImageUrl: null,
  photoUrl: '/images/mock-pet.jpg',
  description: '내용을 작성해주세요내용을 작성해주세요내용을 작성해주세요내용을 작성해주세요',
  voteCount: 0,
  rank: null,
  hasVoted: false,
  isMyEntry: false,
  createdAt: '2025-04-26T10:00:00Z',
}

export const MOCK_RANKING_ENTRIES: ContestEntry[] = [
  { ...CONTEST_ENTRY_BASE, id: '1', rank: 1, voteCount: 42 },
  { ...CONTEST_ENTRY_BASE, id: '2', rank: 2, voteCount: 38 },
  { ...CONTEST_ENTRY_BASE, id: '3', rank: 3, voteCount: 31 },
]

export const MOCK_VOTE_ENTRIES: ContestEntry[] = Array.from({ length: 9 }, (_, i) => ({
  ...CONTEST_ENTRY_BASE,
  id: String(i + 4),
  voteCount: i === 2 ? 20 : 0,
  hasVoted: i === 2,
}))
