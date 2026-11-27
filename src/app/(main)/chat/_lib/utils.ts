const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return '방금전'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간전`
  const days = Math.floor(hours / 24)
  return `${days}일전`
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/**
 * 채팅 목록의 마지막 대화 날짜 — 카카오톡 목록과 같은 표기.
 * 오늘: 오후 3:05 / 어제: 어제 / 올해: 11월 24일 / 그 전 해: 2020. 3. 8.
 */
const formatChatListTime = (dateStr?: string, now = new Date()) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  if (isSameDay(date, now)) {
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${minutes}`
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) return '어제'
  if (date.getFullYear() === now.getFullYear())
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
}

export { formatRelativeTime, formatChatListTime }
