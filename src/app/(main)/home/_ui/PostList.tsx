import { Fragment } from 'react'
import { getFirstPhotoPostId, toCommunityPreviewProps } from '@/entities/community'
import { ConnectedFeedCard } from '@/features/community'
import type { CommunityPostCard } from '@/shared/types'

interface PostListProps {
  posts: CommunityPostCard[]
  /** 글이 없을 때 문구 (마이홈은 '내가 쓴 글이 없습니다.') */
  emptyText?: string
  /** 내 글 목록일 때만 전달 — 카드 ⋯ 메뉴에 수정/삭제 노출 */
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
}

// 커뮤니티 피드(/community)와 같은 단일 컬럼 카드. 모바일 말단과 태블릿 시작점의
// 실내용 폭을 672px로 맞추고, PC에서 프로필 카드 폭(948px)까지 넓힌다.
// 내 글 목록은 어디까지가 한 글인지 바로 보여야 해서 카드 사이에 구분선을 남긴다
// (gap을 커뮤니티의 절반으로 두어 구분선 포함 간격이 24/32/40으로 같아진다)
const PostList = ({ posts, emptyText = '게시글이 없습니다.', onEdit, onDelete }: PostListProps) => {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-sm leading-[1.5] font-medium text-neutral-700">
        {emptyText}
      </p>
    )
  }

  const firstPhotoPostId = getFirstPhotoPostId(posts)

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-168 flex-col gap-3 tab:gap-4 pc:max-w-[59.25rem] pc:gap-5">
      {posts.map((post, index) => (
        <Fragment key={post.postId}>
          <ConnectedFeedCard
            {...toCommunityPreviewProps(post)}
            preload={post.postId === firstPhotoPostId}
            // 마이홈 카드는 Container 폭을 다 쓰므로 정사각 캐러셀 대신 가로 스크롤로 늘어놓는다
            mediaLayout="row"
            onEdit={onEdit && (() => onEdit(post.postId))}
            onDelete={onDelete && (() => onDelete(post.postId))}
          />
          {index < posts.length - 1 && <div className="h-px w-full bg-neutral-300" />}
        </Fragment>
      ))}
    </div>
  )
}

export { PostList }
