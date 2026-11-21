import { postNativeMessage, subscribeNativeMessage } from './nativeBridge'

/**
 * 앱(UA PawpongStack/)이 상세 WebView 를 하나 미리 띄워 두고 목록 위로 밀어 올리는 약속.
 * 앱(pawpong_rn features/native-stack/model/stackProtocol)의 이름·경로 규칙과 같아야 한다.
 * WebView 는 목록(루트) 1개 + 상세 1개. 상세 안에서 다른 상세로 가면 같은 WebView 안에서 이동한다.
 */
export const STACK_MESSAGE = {
  /** 웹(루트) → 앱: 상세 링크를 눌렀다. 루트 문서는 이동하지 않는다 */
  OPEN_SCREEN: 'OPEN_SCREEN',
  /** 웹 → 앱: 뒤로 버튼. 웹 뒤로 / 화면 닫기는 앱이 고른다 */
  BACK: 'BACK',
  /** 웹 → 앱: 변경 성공 직후의 최종 값 */
  STACK_CHANGE: 'STACK_CHANGE',
  /** 앱 → 웹: 다른 WebView 에서 생긴 변경들 */
  STACK_CHANGES: 'STACK_CHANGES',
  /** 웹(상세) → 앱: 대기 화면에서 준비됐다 */
  STACK_READY: 'STACK_READY',
  /** 웹(상세) → 앱: 화면이 바뀌었다. atBase 면 처음 연 화면이다 */
  STACK_ROUTE: 'STACK_ROUTE',
  /** 앱 → 웹(상세): 이 화면으로 SPA 이동 */
  STACK_NAVIGATE: 'STACK_NAVIGATE',
  /** 앱 → 웹(상세): 닫혔다. 대기 화면으로 돌아가 페이지 메모리를 비운다 */
  STACK_RESET: 'STACK_RESET',
} as const

/** 상세 WebView 의 대기 화면 (app/app-shell) */
export const STACK_SHELL_PATH = '/app-shell'

// 브리더 홈·분양 상세만. id 가 ObjectId 라 /adoption/create 같은 경로와 섞이지 않는다
const STACK_PATH = /^\/(home|adoption)\/[0-9a-f]{24}$/

export type StackChange =
  | { kind: 'breeder-favorite'; id: string; isFavorited: boolean }
  | { kind: 'adoption-favorite'; id: string; isFavorited: boolean; favoriteCount: number }

type StackWindow = Window & {
  ReactNativeWebView?: unknown
  __PAWPONG_STACK_LAYER__?: string
}

/** 앱이 상세 WebView 를 쓰는지 (루트 레이아웃이 UA 를 보고 data-native-stack 으로 표시한다) */
export const hasNativeStack = (): boolean =>
  typeof window !== 'undefined' &&
  Boolean((window as StackWindow).ReactNativeWebView) &&
  document.documentElement.dataset.nativeStack !== undefined

/** 이 문서가 앱이 미리 띄운 상세 WebView 인지 (앱이 문서 시작 전에 표시를 심는다) */
export const isDetailLayer = (): boolean =>
  typeof window !== 'undefined' && (window as StackWindow).__PAWPONG_STACK_LAYER__ === 'detail'

export const isStackPath = (href: string): boolean => {
  try {
    return STACK_PATH.test(new URL(href, window.location.origin).pathname)
  } catch {
    return false
  }
}

/** 상세 WebView 로 열 주소인지 — 같은 출처, 허용 경로, 지금 화면이 아닌 곳 */
export const isStackHref = (url: URL): boolean =>
  url.origin === window.location.origin &&
  STACK_PATH.test(url.pathname) &&
  url.pathname !== window.location.pathname

/** 뒤로 버튼 — 앱이 상세 WebView 를 쓰면 판단을 앱에 맡기고, 아니면 웹 뒤로 */
export const goBackFromScreen = (fallback: () => void): void => {
  if (hasNativeStack()) postNativeMessage({ type: STACK_MESSAGE.BACK })
  else fallback()
}

export const postStackChange = (change: StackChange): void => {
  if (hasNativeStack()) postNativeMessage({ type: STACK_MESSAGE.STACK_CHANGE, ...change })
}

/** 다른 WebView 에서 생긴 변경 중 이 종류만 받는다 */
export const subscribeStackChanges = <K extends StackChange['kind']>(
  kind: K,
  onChange: (change: Extract<StackChange, { kind: K }>) => void,
): (() => void) =>
  subscribeNativeMessage(STACK_MESSAGE.STACK_CHANGES, ({ changes }) => {
    if (!Array.isArray(changes)) return
    for (const change of changes as StackChange[]) {
      if (change?.kind === kind) onChange(change as Extract<StackChange, { kind: K }>)
    }
  })

const INDEX_KEY = '__pawpongIdx'
let historyIndex = 0
let historyIndexInstalled = false

/**
 * 상세 WebView 의 히스토리 위치를 센다. 다시 쓰는 WebView 라 canGoBack 은 대기 화면 이전 기록까지 포함해
 * '처음 연 화면인지' 판단에 쓸 수 없다. Next 의 이동도 window.history.pushState 를 거치므로
 * 한 번 감싸 두면 push 는 +1, replace 는 그대로, 뒤로·앞으로는 기록된 값으로 돌아간다.
 */
export const installHistoryIndex = (): void => {
  if (historyIndexInstalled) return
  historyIndexInstalled = true
  const { history } = window
  const push = history.pushState.bind(history)
  const replace = history.replaceState.bind(history)
  const withIndex = (data: unknown, index: number) => ({
    ...(data && typeof data === 'object' ? data : {}),
    [INDEX_KEY]: index,
  })
  history.pushState = (data, unused, url) => push(withIndex(data, ++historyIndex), unused, url)
  history.replaceState = (data, unused, url) => replace(withIndex(data, historyIndex), unused, url)
  window.addEventListener('popstate', (event) => {
    const index: unknown = event.state?.[INDEX_KEY]
    if (typeof index === 'number') historyIndex = index
  })
  history.replaceState(history.state, '')
}

export const getHistoryIndex = (): number => historyIndex
