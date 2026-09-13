import type { ReactNode } from 'react'
import { Container } from '@/shared/ui'

interface HomeColumnsProps {
  /** 좌측 컬럼 — 프로필 카드, (탭이 있는 화면이면) 세로 메뉴까지 */
  sidebar: ReactNode
  /** 사이드바 sticky 상단 오프셋(px) */
  stickyTop: number
  children: ReactNode
}

/**
 * [refactored] 홈 계열의 블로그형 2단 골격 — 마이홈·공개 홈이 각자 복제하던 것을 한 벌로.
 *
 * 태블릿(768+)부터 좌 프로필(sticky) / 우 콘텐츠로 나뉘고, 모바일은 그대로 쌓인다.
 * 컬럼이 이미 셸 여백 안이라 거터를 여기서 한 번만 끄면(--page-gutter:0) 안쪽 블록은
 * 자기 좌우 여백을 손대지 않아도 된다.
 */
const HomeColumns = ({ sidebar, stickyTop, children }: HomeColumnsProps) => (
  <div className="tab:mx-auto tab:flex tab:w-full tab:max-w-[86rem] tab:items-start tab:gap-6 tab:page-gutter-x pc:max-w-[90rem] pc:gap-10">
    <Container
      className="px-4 py-5 tab:sticky tab:w-60 tab:shrink-0 tab:py-8 tab:[--page-gutter:0px] pc:w-65 pc:py-10"
      style={{ top: stickyTop }}
    >
      {sidebar}
    </Container>

    <div className="min-w-0 tab:flex-1 tab:pt-8 tab:[--page-gutter:0px] pc:pt-10">{children}</div>
  </div>
)

export { HomeColumns }
