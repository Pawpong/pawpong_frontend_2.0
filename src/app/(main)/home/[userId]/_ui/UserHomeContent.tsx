'use client'

import { Container, Separator } from '@/shared/ui'
import { MOCK_MY_HOME_PROFILE, MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { ProfileCard } from '../../_ui/ProfileCard'
import { HomeTitle } from '../../_ui/HomeTitle'
import { PostList } from '../../_ui/PostList'
import { FooterPlaceholder } from '../../_ui/FooterPlaceholder'

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId: _userId }: UserHomeContentProps) => {
  // TODO: API 연동 후 userId로 데이터 fetch
  const profile = MOCK_MY_HOME_PROFILE
  const posts = MOCK_MY_HOME_POSTS

  return (
    <div className="flex w-full flex-col">
      <HomeTitle title={profile.nickname} />

      <Container className="pc:px-[10rem]">
        <ProfileCard profile={profile} mode="other" />
      </Container>

      <Separator className="bg-border-light tab:hidden" />

      <Container className="pc:px-[10rem]">
        <PostList posts={posts} />
      </Container>

      <FooterPlaceholder />
    </div>
  )
}

export { UserHomeContent }
