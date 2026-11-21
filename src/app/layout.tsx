import type { Metadata } from 'next'
import { createPageMetadata } from '@/shared/lib/metadata'
import { SITE_URL } from '@/shared/config'
import { QueryProvider } from '@/shared/lib/QueryProvider'
import { NavigationGuardProvider } from '@/shared/lib/NavigationGuardContext'
import { cafe24Proup, pretendard } from '@/shared/lib/fonts'
import { NativePushSession } from '@/shared/lib/NativePushSessionBridge'
import { SessionRecoveryBridge } from '@/shared/lib/SessionRecoveryBridge'
import { NativePhotoPickerBridge } from '@/shared/lib/NativePhotoPickerBridge'
import { NativeViewportBridge } from '@/shared/lib/NativeViewportBridge'
import { PawpongAnalytics } from '@/shared/lib/PawpongAnalytics'
import { Suspense } from 'react'
import { AppFlagBridge } from '@/shared/lib/AppFlagBridge'
import { NativeTabSync } from '@/widgets/bottom-nav'
import { NativeStackSync } from './_lib/NativeStackSync'
import { MakerCreditConsole } from '@/shared/lib/MakerCreditConsole'
import { MAKER_AUTHORS, WEBSITE_STRUCTURED_DATA } from '@/shared/lib/makerCredit'
import { StructuredData } from '@/shared/ui/StructuredData'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...createPageMetadata({ title: '포퐁' }),
  authors: MAKER_AUTHORS,
  creator: MAKER_AUTHORS.map(({ name }) => name).join(', '),
}

// RN 웹뷰는 UA 에 PawpongApp/ 을 붙인다. 첫 페인트 전에 표시해 앱 전용 숨김(in-data-app:hidden)이 깜빡이지 않게 한다.
// 앱이 하단 탭 바를 직접 그리면 PawpongTabs/ 도 붙인다 — 웹 하단바를 첫 페인트부터 숨긴다(in-data-native-tabs:hidden)
// 상세를 새 네이티브 화면으로 쌓는 앱은 PawpongStack/ 을 붙인다(NativeStackSync)
const APP_DETECT_SCRIPT = `var u=navigator.userAgent,d=document.documentElement.dataset;if(/PawpongApp\\//.test(u))d.app='';if(/PawpongTabs\\//.test(u))d.nativeTabs='';if(/PawpongStack\\//.test(u))d.nativeStack=''`

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${cafe24Proup.variable}`}
      suppressHydrationWarning
    >
      {/* 브라우저 확장(LocatorJS 등)이 hydrate 전에 head 속성을 붙여 생기는 경고만 막는다 — 이 태그 속성에만 적용 */}
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: APP_DETECT_SCRIPT }} />
        <link rel="author" href="/humans.txt" />
        <StructuredData data={WEBSITE_STRUCTURED_DATA} />
      </head>
      <body className="min-w-0 bg-base-white text-neutral-850">
        <MakerCreditConsole />
        <AppFlagBridge />
        <PawpongAnalytics />
        <NativeViewportBridge />
        <SessionRecoveryBridge />
        <NativePhotoPickerBridge />
        <NativePushSession />
        <QueryProvider>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
          <Suspense fallback={null}>
            <NativeTabSync />
          </Suspense>
          <NativeStackSync />
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
