/**
 * ISO 시간 문자열을 "몇 분/시간/일 전" 형태의 상대 시간으로 변환한다.
 *
 * - 60초 미만: 방금 전
 * - 60분 미만: N분 전
 * - 24시간 미만: N시간 전
 * - 7일 미만: N일 전
 * - 그 이상: YYYY.MM.DD
 *
 * 파싱할 수 없는 값(예: 이미 "20시간" 같은 목업 문자열)은 그대로 돌려준다.
 */
export const formatRelativeTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return '방금 전' // 미래 시각(시계 오차 등) 방어

  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return '방금 전'

  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}분 전`

  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`

  const day = Math.floor(hour / 24)
  if (day < 7) return `${day}일 전`

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}
