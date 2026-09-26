import type { CommunityHallOfFame } from '@/shared/types'

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** UTC ISO → KST 벽시계 'M.D' */
const toKstMonthDay = (instant: number) => {
  const kst = new Date(instant + KST_OFFSET_MS)
  return `${kst.getUTCMonth() + 1}.${kst.getUTCDate()}`
}

/**
 * 회차 표기 — { title: '9월 3회차', range: '9.21 ~ 9.30' }.
 * endDate 는 다음 회차 시작(배타적)이라 1ms 빼서 마지막 날을 구한다.
 */
export const formatHallOfFamePeriod = ({ periodKey, startDate, endDate }: CommunityHallOfFame) => {
  const [, month, index] = periodKey.split('-')
  return {
    title: `${month}월 ${index}회차`,
    range: `${toKstMonthDay(Date.parse(startDate))} ~ ${toKstMonthDay(Date.parse(endDate) - 1)}`,
  }
}
