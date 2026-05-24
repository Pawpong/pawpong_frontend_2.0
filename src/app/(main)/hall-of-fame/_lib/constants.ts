import type { HomeUserType } from '@/shared/types'

/** 랭킹 기간 */
export type RankingPeriod = 'current' | 'previous'

export const RANKING_PERIOD_CONFIG: Record<RankingPeriod, { title: string; buttonLabel: string; next: RankingPeriod }> = {
  current: { title: '실시간 랭킹 1위~3위', buttonLabel: '< 저번주 랭킹', next: 'previous' },
  previous: { title: '저번주 랭킹 1위~3위', buttonLabel: '이번주 랭킹>', next: 'current' },
}

/** 유저 타입별 콘테스트 액션 */
export const CONTEST_ACTION: Record<HomeUserType, { label: string; href: string }> = {
  breeder: { label: '콘테스트 참여하기', href: '/hall-of-fame/participate' },
  adopter: { label: '나의 참여 보기', href: '/hall-of-fame/participate' },
}
