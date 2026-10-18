import type { CommunityHallOfFame } from '@/shared/types'

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** UTC ISO → KST 벽시계 'M.D' */
const toKstMonthDay = (instant: number) => {
  const kst = new Date(instant + KST_OFFSET_MS)
  return `${kst.getUTCMonth() + 1}.${kst.getUTCDate()}`
}

/**
 * 회차 표기 — { year: '2026', title: '9월 3회차', range: '9.21 ~ 9.30', summary }.
 * endDate 는 다음 회차 시작(배타적)이라 1ms 빼서 마지막 날을 구한다.
 * 기간은 항상 표시하고 진행 중(open)이면 집계 상태와 마지막 갱신 시각을 덧붙인다.
 */
export const formatHallOfFamePeriod = ({
  periodKey,
  startDate,
  endDate,
  state,
  refreshedAt,
}: CommunityHallOfFame) => {
  const [year, month, index] = periodKey.split('-')
  const title = `${month}월 ${index}회차`
  const range = `${toKstMonthDay(Date.parse(startDate))} ~ ${toKstMonthDay(Date.parse(endDate) - 1)}`
  const refreshed = Date.parse(refreshedAt)
  const refreshedLabel =
    Number.isFinite(refreshed) && refreshed > 0
      ? `${toKstMonthDay(refreshed)} ${new Date(refreshed + KST_OFFSET_MS).getUTCHours()}시 기준`
      : '첫 집계 대기'
  return {
    year,
    title,
    range,
    summary: `${title} · ${range}${state === 'open' ? ` · 집계 중 (${refreshedLabel})` : ''}`,
  }
}
