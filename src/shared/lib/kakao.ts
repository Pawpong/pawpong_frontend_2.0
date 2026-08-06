// Kakao JS SDK를 필요 시점에만 로드/초기화 (전역 <Script> 대신 lazy — 공유 클릭 시에만 로드)

const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'

interface KakaoLink {
  mobileWebUrl: string
  webUrl: string
}

type KakaoFeedShareSettings = {
  objectType: 'feed'
  content: {
    title: string
    description: string
    imageUrl: string
    link: KakaoLink
  }
  buttons?: { title: string; link: KakaoLink }[]
}

type KakaoTextShareSettings = {
  objectType: 'text'
  text: string
  link: KakaoLink
  buttonTitle?: string
}

type KakaoShareSettings = KakaoFeedShareSettings | KakaoTextShareSettings

export interface KakaoSDK {
  isInitialized: () => boolean
  init: (key: string) => void
  Share: {
    sendDefault: (settings: KakaoShareSettings) => void
  }
}

declare global {
  interface Window {
    Kakao?: KakaoSDK
  }
}

let scriptPromise: Promise<void> | null = null

const loadScript = () => {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.Kakao) return resolve()
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Kakao SDK 로드 실패'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** SDK 로드 + init 후 window.Kakao 반환. 실패 사유는 호출부에서 사용자에게 안내한다. */
export const getKakao = async (): Promise<KakaoSDK> => {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
  if (!key) throw new Error('카카오 JavaScript 키가 설정되지 않았습니다.')
  await loadScript()
  if (!window.Kakao) throw new Error('카카오 SDK를 초기화하지 못했습니다.')
  if (!window.Kakao.isInitialized()) window.Kakao.init(key)
  return window.Kakao
}

// [refactored] 카카오 공유 페이로드 조립 + 전송을 SDK 세부사항과 함께 이 파일에 모음
export interface KakaoSharePayload {
  url: string
  title: string
  description?: string
  /** 절대 URL 권장 — 상대 경로는 현재 origin 기준으로 변환한다 */
  imageUrl?: string
}

/**
 * 카카오 공유창 열기.
 * SDK가 window.open을 동기로 호출하므로 반드시 클릭 핸들러 안에서 await 없이 호출해야 팝업이 차단되지 않는다.
 * (사전에 getKakao()로 로드/init 되어 있어야 한다)
 */
export const shareToKakao = ({ url, title, description, imageUrl }: KakaoSharePayload) => {
  const kakao = window.Kakao
  if (!kakao?.isInitialized()) {
    throw new Error('카카오 공유를 준비하지 못했습니다. 잠시 후 다시 시도해주세요.')
  }

  const link = { mobileWebUrl: url, webUrl: url }
  kakao.Share.sendDefault(
    imageUrl
      ? {
          objectType: 'feed',
          content: {
            title,
            description: description ?? '',
            imageUrl: new URL(imageUrl, window.location.origin).href,
            link,
          },
          buttons: [{ title: '자세히 보기', link }],
        }
      : {
          objectType: 'text',
          text: description ? `${title}\n${description}` : title,
          link,
          buttonTitle: '자세히 보기',
        },
  )
}
