import type { ReactNode } from 'react'

interface CommunityLayoutProps {
  children: ReactNode
  /** 인스타그램 웹처럼 피드 위에 게시글 상세를 모달로 띄우는 병렬 라우트 슬롯 */
  modal: ReactNode
}

const CommunityLayout = ({ children, modal }: CommunityLayoutProps) => (
  <>
    {children}
    {modal}
  </>
)

export default CommunityLayout
