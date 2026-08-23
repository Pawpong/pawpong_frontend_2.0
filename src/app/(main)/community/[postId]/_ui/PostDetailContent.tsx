'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  AuthorInfo,
  BOOKMARK_ACTIVE,
  Container,
  DeleteConfirmModal,
  NavigationBar,
  OwnerActionsMenu,
  PostActionButton,
  Separator,
} from '@/shared/ui'
import { FavoriteIcon, PixelMessageIcon, PixelBookmarkIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import {
  useToggleCommunityPostLike,
  useToggleCommunityPostBookmark,
  useDeleteCommunityPost,
} from '@/features/community'
import { useAuthStatus } from '@/features/auth'
import { CommentSection } from './CommentSection'

// [refactored] 반복되던 섹션 좌우 패딩(모바일 0 / tab 50px)을 상수로 추출
const SECTION_X = 'px-0 tab:px-[3.125rem]'

interface PostDetailContentProps {
  postId: string
}

const PostDetailContent = ({ postId }: PostDetailContentProps) => {
  const router = useRouter()
  const { isLoggedIn } = useAuthStatus()
  const { data: post } = useQuery(communityQueries.detail(postId))
  // 공개 상세라 비로그인 조회도 가능 — 로그인 상태에서만 내 프로필을 조회(비로그인 401 리다이렉트 방지)
  const { data: me } = useQuery({ ...profileQueries.me(), enabled: isLoggedIn })

  // [refactored] 훅 반환값을 구조분해 — 호출부에서 toggleLike.toggleLike 처럼 겹쳐 쓰지 않게
  const { toggleLike, isPending: isLikePending } = useToggleCommunityPostLike(
    postId,
    post?.isLiked ?? false,
  )
  const { toggleBookmark, isPending: isBookmarkPending } = useToggleCommunityPostBookmark(
    postId,
    post?.isSaved ?? false,
  )
  const deletePost = useDeleteCommunityPost()

  const [confirmDeletePost, setConfirmDeletePost] = useState(false)

  if (!post) return null

  const isOwner = !!me?.userId && me.userId === post.authorId

  // 삭제 성공 시에만 목록으로 이동 (실패하면 모달을 유지해 재시도 가능)
  const handleDeletePost = () => {
    if (deletePost.isPending) return
    deletePost.mutate(postId, { onSuccess: () => router.push('/community') })
  }

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title={`${post.authorNickname}님의 게시물`} backHref="/community" />

      {/* Main: Detail (PC 948px 가운데 정렬, Figma 2063-226866)
          padding 세로: mo·tab 24 / pc 40, 가로: mo16(px-4)·tab48·pc80(Container) */}
      <Container className="px-4 py-6 pc:py-10">
        {/* [refactored] 사이드바 제거 후 남은 min-w-0 flex-1 래퍼 삭제 */}
        <div className="mx-auto w-full pc:max-w-[59.25rem]">
          {/* Post Detail Card */}
          <div className="tab:overflow-hidden tab:rounded-2xl tab:border tab:border-border-light">
            {/* Post Header — chat-profile (Figma 1199:35602): 아바타40 + 이름·시각 + 본문(전체) */}
            <div
              className={cn(
                'flex items-start justify-between gap-2 pt-[1.176rem] tab:pt-8',
                SECTION_X,
              )}
            >
              <AuthorInfo
                size="md"
                authorId={post.authorId}
                nickname={post.authorNickname}
                profileImageUrl={post.authorProfileImageUrl}
                createdAt={post.createdAt}
                contentSlot={
                  <p className="mt-1 text-sm font-bold whitespace-pre-wrap text-text-secondary">
                    {post.body}
                  </p>
                }
              />
              {isOwner && (
                <OwnerActionsMenu
                  onEdit={() => router.push(`/community/${postId}/edit`)}
                  onDelete={() => setConfirmDeletePost(true)}
                />
              )}
            </div>

            {/* Image Grid */}
            <div className="-mx-[1.25rem] mt-[1.097rem] flex gap-3 overflow-hidden pl-[1.25rem] tab:mx-0 tab:mt-[2.179rem] tab:pl-[3.125rem]">
              {post.photoUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative h-[8.995rem] w-[14.6147rem] shrink-0 overflow-hidden rounded-[0.67rem] bg-fill-placeholder tab:aspect-[349/215] tab:h-auto tab:w-[21.8125rem] tab:rounded-2xl"
                >
                  {url && (
                    <Image
                      src={url}
                      alt={`게시글 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Actions — 카드와 동일한 공통 아이콘셋 (좋아요·댓글·북마크, size-8) */}
            <div
              className={cn('mt-[0.763rem] flex items-center gap-2 tab:mt-[0.96rem]', SECTION_X)}
            >
              <PostActionButton
                icon={FavoriteIcon}
                count={post.likeCount}
                iconClassName="size-8"
                ariaLabel="좋아요"
                active={post.isLiked}
                iconStatus={post.isLiked ? 'fill' : 'default'}
                onClick={toggleLike}
                disabled={isLikePending}
              />
              <PostActionButton
                icon={PixelMessageIcon}
                count={post.commentCount}
                iconClassName="size-8"
              />
              <PostActionButton
                icon={PixelBookmarkIcon}
                iconClassName="size-8"
                ariaLabel="북마크"
                active={post.isSaved}
                activeClassName={BOOKMARK_ACTIVE}
                onClick={toggleBookmark}
                disabled={isBookmarkPending}
              />
            </div>

            {/* Comments */}
            <Separator fullWidth className="mt-4 bg-border-light tab:mx-0 tab:w-full" />
            {/* [refactored] 댓글 입력·스레드·무한스크롤을 CommentSection으로 분리 */}
            <div className={cn('pb-4 tab:pb-8', SECTION_X)}>
              <CommentSection postId={postId} />
            </div>
          </div>
        </div>
      </Container>

      {/* [refactored] 게시글 삭제 확인 — 공통 DeleteConfirmModal */}
      <DeleteConfirmModal
        open={confirmDeletePost}
        onOpenChange={setConfirmDeletePost}
        target="게시글"
        onConfirm={handleDeletePost}
        isPending={deletePost.isPending}
      />
    </div>
  )
}

export { PostDetailContent }
