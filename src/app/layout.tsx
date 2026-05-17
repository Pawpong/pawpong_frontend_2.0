import type { Metadata } from 'next'
import { QueryProvider } from '@/shared/lib/QueryProvider'
import { NavigationGuardProvider } from '@/shared/lib/NavigationGuardContext'
import { cafe24Proup, pretendard } from '@/shared/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pawpong',
  description: 'Pawpong',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} ${cafe24Proup.variable}`}>
        <QueryProvider>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
