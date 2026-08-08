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

export { formatRelativeTime }
