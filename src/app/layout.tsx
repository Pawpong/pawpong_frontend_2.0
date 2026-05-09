import type { Metadata } from 'next'
import { QueryProvider } from '@/shared/lib/QueryProvider'
import { Container } from '@/shared/ui'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pawpong',
  description: 'Pawpong',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <Container>{children}</Container>
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
