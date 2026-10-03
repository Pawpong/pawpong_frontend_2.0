import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({ title: '활동 내역', noIndex: true })

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
