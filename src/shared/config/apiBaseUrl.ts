/** Android 에뮬레이터의 localhost는 개발 Mac이 아닌 단말 자신을 가리킨다. */
export const resolveApiBaseUrl = (
  configuredUrl: string,
  isDevelopment: boolean,
  browserHostname?: string,
): string => {
  const base = configuredUrl.replace(/\/+$/, '')
  if (!isDevelopment || browserHostname !== '10.0.2.2') return base
  try {
    const url = new URL(base)
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) {
      url.hostname = browserHostname
      return url.href.replace(/\/+$/, '')
    }
  } catch {
    // 상대 경로나 비어 있는 설정은 기존 same-origin 동작을 유지한다.
  }
  return base
}

export const getApiBaseUrl = (fallback = '') =>
  resolveApiBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? fallback,
    process.env.NODE_ENV === 'development',
    typeof window === 'undefined' ? undefined : window.location.hostname,
  )
