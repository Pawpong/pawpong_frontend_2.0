const INTERNAL_ORIGIN = 'https://pawpong.internal'

/**
 * OAuth 왕복 뒤 이동할 경로를 현재 사이트 내부의 절대 경로로 제한한다.
 * 외부 URL, protocol-relative URL, 역슬래시 기반 우회는 fallback으로 치환한다.
 */
const normalizeReturnUrl = (value: string | null | undefined, fallback = '/'): string => {
  if (!value?.startsWith('/') || value.startsWith('//')) return fallback

  try {
    const url = new URL(value, INTERNAL_ORIGIN)
    if (url.origin !== INTERNAL_ORIGIN) return fallback

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export { normalizeReturnUrl }
