import { PostDetailModal } from './_ui/PostDetailModal'

interface InterceptedPostModalPageProps {
  params: Promise<{ postId: string }>
}

/**
 * /community 안에서 클릭으로 진입했을 때만 매칭되는 인터셉트 라우트.
 * 새로고침이나 링크 공유로 직접 들어오면 실제 상세 페이지(../../[postId]/page.tsx)가 렌더된다.
 */
const InterceptedPostModalPage = async ({ params }: InterceptedPostModalPageProps) => {
  const { postId } = await params
  return <PostDetailModal postId={postId} />
}

export default InterceptedPostModalPage
