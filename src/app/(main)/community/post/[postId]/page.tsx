import { getPostMetadata } from '@/app/_lib/contentMetadata'
import { PostDetailContent } from './_ui/PostDetailContent'

interface CommunityPostDetailPageProps {
  params: Promise<{ postId: string }>
}

export const generateMetadata = async ({ params }: CommunityPostDetailPageProps) =>
  getPostMetadata((await params).postId)

const CommunityPostDetailPage = async ({ params }: CommunityPostDetailPageProps) => {
  const { postId } = await params
  return <PostDetailContent postId={postId} />
}

export default CommunityPostDetailPage
