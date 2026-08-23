import { PostDetailModal } from './_ui/PostDetailModal'

interface InterceptedPostModalPageProps {
  params: Promise<{ postId: string }>
}

/**
 * 최은진: 신규 파일 — @modal 슬롯의 인터셉트 라우트 진입점.
 * /community 안에서 클릭으로 진입했을 때만 매칭되는 인터셉트 라우트 (Next.js Intercepting Routes).
 * 새로고침이나 링크 공유로 직접 들어오면 이 파일이 아니라 실제 상세 페이지(../../[postId]/page.tsx)가 렌더된다 —
 * 인스타그램 웹의 "피드에선 모달, 퍼머링크는 풀페이지" 동작과 동일하다.
 */
const InterceptedPostModalPage = async ({ params }: InterceptedPostModalPageProps) => {
  const { postId } = await params
  return <PostDetailModal postId={postId} />
}

export default InterceptedPostModalPage
