import { PageFrame } from '@/shared/ui'

// 이 그룹의 모든 화면은 같은 페이지 틀(1280 · 좌우·위아래 여백)을 쓴다. 폴더를 여기 두면 틀이 정해진다.
const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <PageFrame>{children}</PageFrame>
)

export default PageLayout
