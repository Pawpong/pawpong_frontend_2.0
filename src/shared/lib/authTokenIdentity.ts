/** 인증 검증이 아니라 토큰 갱신과 계정 전환을 구분하는 클라이언트 표시 경계임. */
export function authTokenIdentity(token: string | null): string | null {
  if (!token) return null
  try {
    const encoded = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    if (!encoded) return `opaque:${token}`
    const claims: unknown = JSON.parse(atob(encoded))
    if (!claims || typeof claims !== 'object') return `opaque:${token}`
    const { sub, role } = claims as Record<string, unknown>
    if (typeof sub === 'string' && sub && typeof role === 'string' && role)
      return JSON.stringify([role, sub])
  } catch {
    /* 해석할 수 없는 토큰은 변경 여부를 엄격하게 판단함. */
  }
  return `opaque:${token}`
}
