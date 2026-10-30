import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({ title: '입양 신청', noIndex: true })

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
