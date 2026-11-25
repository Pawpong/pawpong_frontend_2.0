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
import { APP_FLAGS_SCRIPT } from '@/shared/lib/appFlags'
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

// 앱 표시(data-app·data-native-tabs·data-native-stack)는 첫 페인트 전에 붙여 앱 전용 숨김이 깜빡이지 않게 한다.
// UA 표시 목록은 shared/lib/appFlags 한 곳에 있다 (AppFlagBridge 도 같은 목록으로 다시 붙인다).
// 마지막 입력이 터치·마우스면 data-input="pointer" 를 둬 focus-ring 을 숨긴다. Radix 탭처럼 누를 때 코드로 포커스를
// 주는 부품을 iOS WebKit 이 키보드 포커스(:focus-visible)로 보고 테두리를 그리기 때문이다. 키를 누르면 다시 보인다.
const APP_DETECT_SCRIPT = `${APP_FLAGS_SCRIPT}addEventListener('pointerdown',function(){document.documentElement.dataset.input='pointer'},true);addEventListener('keydown',function(){delete document.documentElement.dataset.input},true)`

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
