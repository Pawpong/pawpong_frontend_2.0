import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '포퐁',
  robots: { index: false, follow: false },
}

/**
 * 앱이 미리 띄워 두는 상세 WebView 의 대기 화면 — 아무것도 그리지 않는다.
 * 루트 레이아웃(조회 캐시·앱 연결)만 준비해 두고, 상세를 열면 여기서 SPA 로 이동한다(NativeStackSync).
 */
const AppShellPage = () => null

export default AppShellPage
