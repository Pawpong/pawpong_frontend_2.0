import { createPageMetadata } from '@/shared/lib/metadata'

import { CommunityPostEditor } from '../../../_ui/CommunityPostEditor'

export const metadata = createPageMetadata({ title: '게시글 수정', noIndex: true })

interface CommunityPostEditPageProps {
  params: Promise<{ postId: string }>
}

// 작성 화면과 같은 에디터를 기존 게시글로 채워서 재사용한다
const CommunityPostEditPage = async ({ params }: CommunityPostEditPageProps) => {
  const { postId } = await params
  return <CommunityPostEditor postId={postId} />
}

export default CommunityPostEditPage
