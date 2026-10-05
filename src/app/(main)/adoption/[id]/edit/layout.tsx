import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({ title: '분양글 수정', noIndex: true })

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
