import { PostDetailContent } from './_ui/PostDetailContent'

interface CommunityPostDetailPageProps {
  params: Promise<{ postId: string }>
}

const CommunityPostDetailPage = async ({ params }: CommunityPostDetailPageProps) => {
  const { postId } = await params
  return <PostDetailContent postId={postId} />
}

export default CommunityPostDetailPage
