import type { Metadata } from 'next'
import { QueryProvider } from '@/shared/lib/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pawpong',
  description: 'Pawpong',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
