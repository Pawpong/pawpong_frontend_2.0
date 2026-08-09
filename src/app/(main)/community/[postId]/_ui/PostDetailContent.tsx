'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  AuthorInfo,
  BOOKMARK_ACTIVE,
  Container,
  DeleteConfirmModal,
  InfiniteScrollTrigger,
  NavigationBar,
  OwnerActionsMenu,
  PostActionButton,
  Separator,
} from '@/shared/ui'
import { FavoriteIcon, PixelMessageIcon, PixelBookmarkIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import {
  useToggleCommunityPostLike,
  useCreateCommunityComment,
  useDeleteCommunityPost,
  useBookmarkCommunityPost,
  useUnbookmarkCommunityPost,
} from '@/features/community'
import { useAuthStatus } from '@/features/auth'
import type { CommunityComment } from '@/shared/types'
import { CommentItem } from './CommentItem'
import { CommentComposer } from './CommentComposer'

// [refactored] 반복되던 섹션 좌우 패딩(모바일 0 / tab 50px)을 상수로 추출
const SECTION_X = 'px-0 tab:px-[3.125rem]'

// [refactored] 컴포넌트에서 분리한 순수 함수 — 로드된 댓글로 1단계 스레드(최상위 + 답글) 구성
const buildCommentTree = (comments: CommunityComment[]) => {
  const topLevel = comments.filter((c) => !c.parentCommentId)
  const repliesByParent = comments.reduce<Record<string, CommunityComment[]>>((acc, c) => {
    if (c.parentCommentId) (acc[c.parentCommentId] ??= []).push(c)
    return acc
  }, {})
  return { topLevel, repliesByParent }
}

interface PostDetailContentProps {
  postId: string
}

const PostDetailContent = ({ postId }: PostDetailContentProps) => {
  const router = useRouter()
  const { isLoggedIn } = useAuthStatus()
  const { data: post } = useQuery(communityQueries.detail(postId))
  // 공개 상세라 비로그인 조회도 가능 — 로그인 상태에서만 내 프로필을 조회(비로그인 401 리다이렉트 방지)
  const { data: me } = useQuery({ ...profileQueries.me(), enabled: isLoggedIn })
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(communityQueries.comments(postId))
  const comments = commentsData?.pages.flatMap((page) => page.items) ?? []

  const toggleLike = useToggleCommunityPostLike(postId)
  const bookmark = useBookmarkCommunityPost()
  const unbookmark = useUnbookmarkCommunityPost()
  const createComment = useCreateCommunityComment(postId)
  const deletePost = useDeleteCommunityPost()

  // 답글 대상 (parentCommentId 는 최상위 댓글로 고정 — 1단계 스레드)
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; nickname: string } | null>(
    null,
  )
  const [confirmDeletePost, setConfirmDeletePost] = useState(false)

  if (!post) return null

  const isOwner = !!me?.userId && me.userId === post.authorId

  // [refactored] 트리 구성 로직을 buildCommentTree로 분리
  const { topLevel, repliesByParent } = buildCommentTree(comments)

  const handleReply = (comment: CommunityComment) => {
    // 답글의 답글도 최상위 댓글에 매달아 1단계 스레드를 유지
    setReplyTarget({
      commentId: comment.parentCommentId ?? comment.commentId,
      nickname: comment.authorNickname,
    })
  }

  const handleSubmitComment = async (body: string) => {
    await createComment.mutateAsync({ body, parentCommentId: replyTarget?.commentId })
    setReplyTarget(null)
  }

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
                onClick={() => toggleLike.mutate(post.isLiked)}
                disabled={toggleLike.isPending}
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
                onClick={() => (post.isSaved ? unbookmark : bookmark).mutate(postId)}
                disabled={bookmark.isPending || unbookmark.isPending}
              />
            </div>

            {/* Comments */}
            <Separator fullWidth className="mt-4 bg-border-light tab:mx-0 tab:w-full" />
            <div className={cn('pb-4 tab:pb-8', SECTION_X)}>
              {/* 댓글 입력 (로그인 사용자만) */}
              {isLoggedIn && (
                <CommentComposer
                  onSubmit={handleSubmitComment}
                  isSubmitting={createComment.isPending}
                  profileImageUrl={me?.profileImageUrl}
                  replyingToNickname={replyTarget?.nickname}
                  onCancelReply={() => setReplyTarget(null)}
                />
              )}

              {topLevel.map((comment) => (
                <div key={comment.commentId}>
                  <CommentItem comment={comment} currentUserId={me?.userId} onReply={handleReply} />
                  {(repliesByParent[comment.commentId] ?? []).map((reply) => (
                    <CommentItem
                      key={reply.commentId}
                      comment={reply}
                      currentUserId={me?.userId}
                      onReply={handleReply}
                      isReply
                    />
                  ))}
                </div>
              ))}
              <InfiniteScrollTrigger
                onIntersect={fetchNextPage}
                hasNextPage={hasNextPage ?? false}
                isFetchingNextPage={isFetchingNextPage}
              />
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
