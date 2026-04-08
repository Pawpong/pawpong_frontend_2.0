import type { Metadata } from 'next'
import { QueryProvider } from '@/src/shared/lib/query-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pawpong',
  description: 'Pawpong',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
