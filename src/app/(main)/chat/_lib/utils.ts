// 채팅 시간 표기 — 카카오톡과 같다. 날짜 경계는 모두 보는 사람의 기기 시간대 기준이다.

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const toDate = (dateStr?: string) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? null : date
}

/** 오전 9:05 / 오후 3:05 */
const formatClockTime = (date: Date) => {
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${minutes}`
}

/** 말풍선 옆 시간 — 날짜는 하루 단위 구분선이 맡고 여기는 시각만 쓴다 */
const formatChatMessageTime = (dateStr?: string) => {
  const date = toDate(dateStr)
  return date ? formatClockTime(date) : ''
}

/** 하루 단위 구분선 — 2026년 11월 27일 금요일 */
const formatChatDayLabel = (dateStr?: string) => {
  const date = toDate(dateStr)
  if (!date) return ''
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekday}요일`
}

/** 두 메시지가 다른 날이면 그 사이에 날짜 구분선을 넣는다 (앞 메시지가 없으면 첫 메시지 위에 넣는다) */
const startsNewChatDay = (dateStr?: string, previousDateStr?: string) => {
  const date = toDate(dateStr)
  if (!date) return false
  const previous = toDate(previousDateStr)
  return !previous || !isSameDay(date, previous)
}

/**
 * 채팅 목록의 마지막 대화 날짜 — 카카오톡 목록과 같은 표기.
 * 오늘: 오후 3:05 / 어제: 어제 / 올해: 11월 24일 / 그 전 해: 2020. 3. 8.
 */
const formatChatListTime = (dateStr?: string, now = new Date()) => {
  const date = toDate(dateStr)
  if (!date) return ''
  if (isSameDay(date, now)) return formatClockTime(date)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) return '어제'
  if (date.getFullYear() === now.getFullYear())
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
}

export { formatChatMessageTime, formatChatDayLabel, startsNewChatDay, formatChatListTime }
