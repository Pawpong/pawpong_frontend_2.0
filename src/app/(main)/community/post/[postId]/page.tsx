import { getPublicCommunityPost } from '@/app/_lib/publicCommunityPost'
import { getPostMetadata } from '@/app/_lib/contentMetadata'
import { PostDetailContent } from './_ui/PostDetailContent'

interface CommunityPostDetailPageProps {
  params: Promise<{ postId: string }>
}

export const generateMetadata = async ({ params }: CommunityPostDetailPageProps) =>
  getPostMetadata((await params).postId)

const CommunityPostDetailPage = async ({ params }: CommunityPostDetailPageProps) => {
  const { postId } = await params
  const publicPost = await getPublicCommunityPost(postId)
  return <PostDetailContent postId={postId} publicPost={publicPost ?? undefined} />
}

export default CommunityPostDetailPage
