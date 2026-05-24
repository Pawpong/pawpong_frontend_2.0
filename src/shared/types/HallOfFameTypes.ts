/** 명예의 전당 - 콘테스트 엔트리 */
export interface ContestEntry {
  entryId: string
  imageUrl: string
  description: string
  participant: {
    name: string
    profileImageUrl: string
  }
  rank?: number
  voteCount: number
  isVoted: boolean
}

/** 콘테스트 정보 */
export interface ContestInfo {
  title: string
  participantCount: number
  dateRange: string
}
