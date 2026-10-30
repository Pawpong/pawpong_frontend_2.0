import type { ReactNode } from 'react'

interface CommunityLayoutProps {
  children: ReactNode
  /** 피드 위에 게시글 상세를 모달로 띄우는 병렬 라우트 슬롯 */
  modal: ReactNode
}

/** @modal 병렬 라우트 슬롯을 받기 위한 레이아웃 */
const CommunityLayout = ({ children, modal }: CommunityLayoutProps) => (
  <>
    {children}
    {modal}
  </>
)

export default CommunityLayout
