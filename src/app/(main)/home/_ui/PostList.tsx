import { Separator } from '@/shared/ui'
import { PostCard } from './PostCard'
import type { MyHomePost } from '@/shared/mocks/myHome'

interface PostListProps {
  posts: MyHomePost[]
}

const PostList = ({ posts }: PostListProps) => {
  return (
    <div className="tab:mt-[2.959rem] tab:overflow-hidden tab:rounded-2xl tab:border tab:border-border-light">
      {posts.map((post, index) => (
        <div key={post.id} className="tab:px-[3.125rem]">
          <PostCard post={post} />
          {index < posts.length - 1 && (
            <Separator
              fullWidth
              className="bg-border-light tab:-mx-[3.125rem] tab:w-[calc(100%+6.25rem)]"
            />
          )}
        </div>
      ))}
    </div>
  )
}

export { PostList }
