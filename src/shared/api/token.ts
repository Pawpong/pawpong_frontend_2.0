/** accessToken 쿠키를 읽는다. 서버 환경이거나 쿠키가 없으면 null. */
export const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null

  const raw = document.cookie
    .split('; ')
    .find((item) => item.startsWith('accessToken='))
    ?.slice('accessToken='.length)
  if (!raw) return null

  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
