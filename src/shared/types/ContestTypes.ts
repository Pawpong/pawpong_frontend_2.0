/** 콘테스트 정보 */
export interface ContestInfo {
  id: string
  title: string
  description: string
  benefitText: string
  startDate: string
  endDate: string
  status: 'active' | 'ended'
  participantCount: number
}

/** 콘테스트 엔트리 (투표 항목) */
export interface ContestEntry {
  id: string
  userId: string
  userDisplayName: string
  userProfileImageUrl: string | null
  photoUrl: string
  description: string
  voteCount: number
  rank: number | null
  hasVoted: boolean
  isMyEntry: boolean
  createdAt: string
}

/** 현재 콘테스트 조회 응답 */
export interface ContestCurrent {
  contest: ContestInfo
  ranking: ContestEntry[]
  myVotedEntryId: string | null
  hasEntry: boolean
}

/** 콘테스트 참여 요청 */
export interface SubmitContestEntryRequest {
  photoFileName: string
  description: string
}

/** 콘테스트 참여 응답 */
export interface SubmitContestEntryResponse {
  entryId: string
}

/** 투표 응답 */
export interface ContestVoteResponse {
  entryId: string
  newVoteCount: number
}

/** 이전 콘테스트 랭킹 응답 */
export interface ContestPreviousRanking {
  contest: ContestInfo
  ranking: ContestEntry[]
}

/** 명예의 전당 항목 */
export interface HallOfFameItem {
  contestId: string
  contestTitle: string
  startDate: string
  endDate: string
  winner: ContestEntry
}

/** 랜덤 투표 후보 조회 응답 */
export interface ContestRandomEntry {
  /** 랜덤 투표 후보. 후보 없음 또는 이미 투표한 경우 null */
  entry: ContestEntry | null
  /** 이번 콘테스트에서 이미 투표 완료 여부 */
  alreadyVoted: boolean
}

/** 지난주 TOP 3 조회 응답 */
export interface ContestWeeklyTop {
  weekKey: string
  topEntries: ContestEntry[]
  calculatedAt: string
}

/** 어제 기준 TOP 항목 */
export interface YesterdayTopEntry {
  rank: number
  entry: ContestEntry
  /** 득표율 */
  voteRate: number
}

/** 어제 기준 TOP 3 조회 응답 */
export interface ContestYesterdayTop {
  contestId: string
  ranking: YesterdayTopEntry[]
}

/** 엔트리 목록 조회 파라미터 */
export interface ContestEntriesParams {
  limit?: number
  page?: number
}

/** 명예의 전당 목록 조회 파라미터 */
export interface HallOfFameParams {
  limit?: number
  page?: number
}
