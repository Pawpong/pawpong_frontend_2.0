import { Fragment } from 'react'
import { PostCard, toCommunityPreviewProps } from '@/entities/community'
import type { CommunityPostCard } from '@/shared/types'

interface PostListProps {
  posts: CommunityPostCard[]
  /** 글이 없을 때 문구 (마이홈은 '내가 쓴 글이 없습니다.') */
  emptyText?: string
  /** 내 글 목록일 때만 전달 — 카드 ⋯ 메뉴에 수정/삭제 노출 */
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
}

// 디자인(2046-160971): 모바일은 카드 stack(gap-20), 탭·PC는 #cacaca 보더 박스(rounded-8) + 구분선, 게시글 간 gap-32
// 박스는 max-w-948(59.25rem) 중앙 정렬(frame items-center), 세로 여백(spacing-40)은 래퍼 Container의 py가 담당
const PostList = ({ posts, emptyText = '게시글이 없습니다.', onEdit, onDelete }: PostListProps) => {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-sm leading-[1.5] font-medium text-neutral-700">
        {emptyText}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5 tab:mx-auto tab:max-w-[59.25rem] tab:gap-8 tab:rounded-lg tab:border tab:border-neutral-300 tab:p-3">
      {posts.map((post, index) => (
        <Fragment key={post.postId}>
          <PostCard
            {...toCommunityPreviewProps(post)}
            onEdit={onEdit && (() => onEdit(post.postId))}
            onDelete={onDelete && (() => onDelete(post.postId))}
          />
          {index < posts.length - 1 && (
            <div className="hidden h-px w-full bg-neutral-300 tab:block" />
          )}
        </Fragment>
      ))}
    </div>
  )
}

export { PostList }
