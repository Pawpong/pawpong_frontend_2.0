import Link from 'next/link'
import type { CommunityPostDetail } from '@/shared/types'
import { ArrowBackIcon } from '@/shared/assets'
import { PostDetailPanel } from '../../../_ui/PostDetailPanel'

interface PostDetailContentProps {
  postId: string
  publicPost?: CommunityPostDetail
}

/** 공유 링크와 새로고침으로 여는 상세 페이지. 문서 전체가 자연스럽게 스크롤된다. */
const PostDetailContent = ({ postId, publicPost }: PostDetailContentProps) => (
  <div>
    <nav aria-label="게시글 경로" className="mb-2">
      <Link
        href="/community"
        className="inline-flex min-h-10 items-center gap-1 rounded text-body-md font-semibold text-action-link focus-ring hover:text-action-link-hover"
      >
        <ArrowBackIcon className="size-5" />
        커뮤니티로 돌아가기
      </Link>
    </nav>
    <PostDetailPanel postId={postId} publicPost={publicPost} layout="page" />
  </div>
)

export { PostDetailContent }
