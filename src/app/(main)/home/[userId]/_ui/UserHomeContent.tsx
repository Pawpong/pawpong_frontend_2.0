'use client'

import { Container, Separator } from '@/shared/ui'
import { MOCK_MY_HOME_PROFILE, MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { ProfileCard } from '../../_ui/ProfileCard'
import { PostCard } from '../../_ui/PostCard'

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId: _userId }: UserHomeContentProps) => {
  // TODO: API 연동 후 userId로 데이터 fetch
  const profile = MOCK_MY_HOME_PROFILE
  const posts = MOCK_MY_HOME_POSTS

  return (
    <div className="flex w-full flex-col">
      {/* Title Section */}
      <div className="px-[1.25rem] tab:px-[6.25rem]">
        <div className="flex items-center justify-center py-[0.75rem] tab:justify-between tab:pb-[3.219rem] tab:pt-[2.969rem]">
          <div className="hidden flex-1 tab:block" />
          <h1 className="text-sm font-semibold leading-[1.5] text-text-primary tab:text-xl tab:font-bold tab:leading-[1.375rem]">
            {profile.nickname}
          </h1>
          <div className="hidden flex-1 tab:block" />
        </div>
      </div>

      {/* Profile Card */}
      <Container className="pc:px-[10rem]">
        <ProfileCard profile={profile} mode="other" />
      </Container>

      {/* Posts Section */}
      <Container className="pc:px-[10rem]">
        <div className="tab:mt-[2.959rem] tab:overflow-hidden tab:rounded-2xl tab:border tab:border-border-light">
          {posts.map((post, index) => (
            <div key={post.id} className="tab:px-[3.125rem]">
              <PostCard post={post} />
              {index < posts.length - 1 && (
                <Separator className="bg-border-light tab:-mx-[3.125rem] tab:w-[calc(100%+6.25rem)]" />
              )}
            </div>
          ))}
        </div>
      </Container>

      {/* Footer Placeholder */}
      <div className="mt-8 h-[22.1rem] w-full bg-surface-placeholder" />
    </div>
  )
}

export { UserHomeContent }
