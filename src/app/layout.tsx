import type { Metadata } from 'next'
import { QueryProvider } from '@/shared/lib/QueryProvider'
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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
