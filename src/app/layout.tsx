import type { Metadata } from 'next'
import { createPageMetadata } from '@/shared/lib/metadata'
import { SITE_URL } from '@/shared/config/site'
import { QueryProvider } from '@/shared/lib/QueryProvider'
import { NavigationGuardProvider } from '@/shared/lib/NavigationGuardContext'
import { cafe24Proup, pretendard } from '@/shared/lib/fonts'
import { NativePushSession } from '@/shared/lib/NativePushSessionBridge'
import { SessionRecoveryBridge } from '@/shared/lib/SessionRecoveryBridge'
import { NativePhotoPickerBridge } from '@/shared/lib/NativePhotoPickerBridge'
import { NativeViewportBridge } from '@/shared/lib/NativeViewportBridge'
import { PawpongAnalytics } from '@/shared/lib/PawpongAnalytics'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...createPageMetadata({ title: '포퐁' }),
}

// RN 웹뷰는 UA 에 PawpongApp/ 을 붙인다. 첫 페인트 전에 표시해 앱 전용 숨김(in-data-app:hidden)이 깜빡이지 않게 한다
const APP_DETECT_SCRIPT = `if(/PawpongApp\\//.test(navigator.userAgent))document.documentElement.dataset.app=''`

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${cafe24Proup.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: APP_DETECT_SCRIPT }} />
      </head>
      <body className="min-w-0 bg-base-white text-neutral-850">
        <PawpongAnalytics />
        <NativeViewportBridge />
        <SessionRecoveryBridge />
        <NativePhotoPickerBridge />
        <NativePushSession />
        <QueryProvider>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
