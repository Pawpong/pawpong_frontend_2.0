import type { ReactNode } from 'react'

// 최은진: 신규 파일 — @modal 병렬 라우트 슬롯을 받으려면 layout이 있어야 해서 추가.
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
