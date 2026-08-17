'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Container, Separator } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { adopterQueries } from '@/entities/adopter'
import { communityQueries } from '@/entities/community'
import { useCreateOrGetChatRoom } from '@/features/send-message'
import { useToggleFollow } from '@/features/profile'
import { ProfileCard } from '../../_ui/ProfileCard'
import { HomeTitle } from '../../_ui/HomeTitle'
import { PostList } from '../../_ui/PostList'
import { FooterPlaceholder } from '../../_ui/FooterPlaceholder'

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId }: UserHomeContentProps) => {
  const router = useRouter()
  const { data: profile } = useQuery(adopterQueries.publicProfile(userId))

  // 게시글 탭 — GET /community/posts?authorId=userId (무한 쿼리 첫 페이지만 노출)
  const { data: postsData } = useInfiniteQuery(communityQueries.userPosts(userId))
  const posts = dedupeBy(flattenPages(postsData), (post) => post.postId)

  // 메시지 보내기 — 채팅방 생성/조회 후 대화로 이동
  const { mutate: startChat, isPending: isStartingChat } = useCreateOrGetChatRoom()
  const handleMessage = () => {
    startChat(
      { breederId: userId },
      {
        onSuccess: (room) => router.push(`/chat?roomId=${room.roomId}`),
        onError: (error) =>
          window.alert(error instanceof Error ? error.message : '채팅을 시작하지 못했습니다.'),
      },
    )
  }

  // 팔로우 토글
  const {
    isFollowing,
    toggleFollow,
    isPending: isFollowPending,
  } = useToggleFollow(userId, profile?.isFollowing ?? false)

  if (!profile) return null

  return (
    <div className="flex w-full flex-col">
      <HomeTitle title={profile.nickname} />

      <Container className="pc:px-[10rem]">
        <ProfileCard
          profile={profile}
          mode="other"
          onMessage={handleMessage}
          isMessagePending={isStartingChat}
          isFollowing={isFollowing}
          onToggleFollow={toggleFollow}
          isFollowPending={isFollowPending}
        />
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
