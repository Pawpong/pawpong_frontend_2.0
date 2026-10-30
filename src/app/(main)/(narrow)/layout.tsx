import { PageFrame } from '@/shared/ui'

// 폼·약관·계정처럼 한 줄로 읽는 화면 — 같은 틀에 폭만 좁다(768).
const NarrowLayout = ({ children }: { children: React.ReactNode }) => (
  <PageFrame narrow>{children}</PageFrame>
)

export default NarrowLayout
