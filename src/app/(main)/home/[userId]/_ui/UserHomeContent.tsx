'use client'

import { useQuery } from '@tanstack/react-query'
import { Container, Separator } from '@/shared/ui'
import type { MyHomePost } from '@/shared/mocks/myHome'
import { adopterQueries } from '@/entities/adopter'
import { communityQueries } from '@/entities/community'
import { toMyHomePost } from '../../_lib/toMyHomePost'
import { ProfileCard } from '../../_ui/ProfileCard'
import { HomeTitle } from '../../_ui/HomeTitle'
import { PostList } from '../../_ui/PostList'
import { FooterPlaceholder } from '../../_ui/FooterPlaceholder'

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId }: UserHomeContentProps) => {
  const { data: profile } = useQuery(adopterQueries.publicProfile(userId))

  // 게시글 탭 — GET /community/posts?authorId=userId
  const { data: postsData } = useQuery(communityQueries.userPosts(userId))
  const posts: MyHomePost[] = (postsData?.items ?? []).map(toMyHomePost)

  if (!profile) return null

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
