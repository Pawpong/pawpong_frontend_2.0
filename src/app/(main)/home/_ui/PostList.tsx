import { Fragment } from 'react'
import { PostCard } from '@/entities/community'
import { toPostCardProps, type MyHomePost } from '@/shared/mocks/myHome'

interface PostListProps {
  posts: MyHomePost[]
}

// 디자인(2046-160971): 모바일은 카드 stack(gap-20), 탭·PC는 #cacaca 보더 박스(rounded-8) + 구분선, 게시글 간 gap-32
// 박스는 max-w-948(59.25rem) 중앙 정렬(frame items-center), 세로 여백(spacing-40)은 래퍼 Container의 py가 담당
const PostList = ({ posts }: PostListProps) => {
  return (
    <div className="flex flex-col gap-5 tab:mx-auto tab:max-w-[59.25rem] tab:gap-8 tab:rounded-lg tab:border tab:border-[#cacaca] tab:p-3">
      {posts.map((post, index) => (
        <Fragment key={post.id}>
          {/* [refactored] 매핑은 toPostCardProps로 단일화 */}
          <PostCard {...toPostCardProps(post)} />
          {index < posts.length - 1 && (
            <div className="hidden h-px w-full bg-[#cacaca] tab:block" />
          )}
        </Fragment>
      ))}
    </div>
  )
}

export { PostList }
