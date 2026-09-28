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
 * summary 는 진행 중(open)이면 매시 정각 집계 시각('9월 3회차 · 9.26 14시 기준'),
 * 확정(final)이면 기간('9월 3회차 · 9.21 ~ 9.30').
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
  const refreshedLabel = `${toKstMonthDay(refreshed)} ${new Date(refreshed + KST_OFFSET_MS).getUTCHours()}시 기준`
  return {
    year,
    title,
    range,
    summary: `${title} · ${state === 'open' ? refreshedLabel : range}`,
  }
}
