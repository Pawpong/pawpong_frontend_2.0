// 서버 렌더 중 요청별 토큰을 읽는 함수. app 레이어의 서버 프리패치가 등록한다.
// 토큰 값 자체를 여기 두지 않는다 — 모듈 변수는 동시에 들어온 모든 요청이 같이 쓰기 때문이다.
let serverTokenReader: (() => string | null) | null = null

export const setServerTokenReader = (reader: () => string | null) => {
  serverTokenReader = reader
}

/** accessToken 쿠키를 읽는다. 서버에서는 등록된 요청별 토큰, 없으면 null. */
export const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return serverTokenReader?.() ?? null

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
