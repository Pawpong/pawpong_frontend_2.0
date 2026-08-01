'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  AuthorInfo,
  BOOKMARK_ACTIVE,
  Container,
  CtaModal,
  InfiniteScrollTrigger,
  NavigationBar,
  PostActionButton,
  Separator,
} from '@/shared/ui'
import { FavoriteIcon, PixelMessageIcon, PixelBookmarkIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { MOCK_COMMUNITY_POST_DETAIL, MOCK_COMMUNITY_COMMENTS } from '@/shared/mocks/community'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import {
  useToggleCommunityPostLike,
  useCreateCommunityComment,
  useUpdateCommunityPost,
  useDeleteCommunityPost,
  useBookmarkCommunityPost,
  useUnbookmarkCommunityPost,
} from '@/features/community'
import { VisibilitySelect, type VisibilityType } from '@/widgets/post-form'
import { useAuthStatus } from '@/features/auth'
import type { CommunityComment } from '@/shared/types'
import { OwnerActionsMenu } from '../../_ui/OwnerActionsMenu'
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
  // ponytail: dev-api 다운 중 화면 확인용 — throwOnError:false + 목데이터 폴백. 서버 복구되면 지운다.
  const { data: post = MOCK_COMMUNITY_POST_DETAIL } = useQuery({
    ...communityQueries.detail(postId),
    throwOnError: false,
  })
  // 공개 상세라 비로그인 조회도 가능 — 로그인 상태에서만 내 프로필을 조회(비로그인 401 리다이렉트 방지)
  const { data: me } = useQuery({ ...profileQueries.me(), enabled: isLoggedIn })
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({ ...communityQueries.comments(postId), throwOnError: false })
  const comments = commentsData?.pages.flatMap((page) => page.items) ?? MOCK_COMMUNITY_COMMENTS

  const toggleLike = useToggleCommunityPostLike(postId)
  const bookmark = useBookmarkCommunityPost()
  const unbookmark = useUnbookmarkCommunityPost()
  const createComment = useCreateCommunityComment(postId)
  const updatePost = useUpdateCommunityPost(postId)
  const deletePost = useDeleteCommunityPost()

  // 답글 대상 (parentCommentId 는 최상위 댓글로 고정 — 1단계 스레드)
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; nickname: string } | null>(
    null,
  )
  // 게시글 인라인 수정
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editBody, setEditBody] = useState('')
  const [editVisibility, setEditVisibility] = useState<VisibilityType>('public')
  const [confirmDeletePost, setConfirmDeletePost] = useState(false)

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

  const startEditPost = () => {
    setEditBody(post.body)
    setEditVisibility(post.visibility)
    setIsEditingPost(true)
  }

  const handleSavePost = async () => {
    const trimmed = editBody.trim()
    if (!trimmed || updatePost.isPending) return
    await updatePost.mutateAsync({ body: trimmed, visibility: editVisibility })
    setIsEditingPost(false)
  }

  const handleDeletePost = () => {
    void deletePost.mutateAsync(postId).then(() => router.push('/community'))
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
                  isEditingPost ? (
                    <div className="mt-2 flex flex-col gap-3">
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        maxLength={2000}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-[#d3d3d3] px-3 py-2 text-sm outline-none focus:border-text-primary"
                      />
                      <div className="flex items-center justify-between">
                        <VisibilitySelect value={editVisibility} onChange={setEditVisibility} />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingPost(false)}
                            className="rounded-full border border-[#cacaca] px-4 py-1.5 text-sm font-semibold text-text-secondary"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleSavePost}
                            disabled={updatePost.isPending}
                            className="rounded-full bg-fill-muted px-4 py-1.5 text-sm font-semibold text-text-primary disabled:opacity-50"
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm font-bold whitespace-pre-wrap text-text-secondary">
                      {post.body}
                    </p>
                  )
                }
              />
              {isOwner && !isEditingPost && (
                <OwnerActionsMenu
                  onEdit={startEditPost}
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

      {/* 게시글 삭제 확인 */}
      <CtaModal
        open={confirmDeletePost}
        onOpenChange={setConfirmDeletePost}
        title="게시글을 삭제할까요?"
        description="삭제한 게시글은 복구할 수 없습니다."
        actions={[
          { label: '취소', variant: 'outline', onClick: () => setConfirmDeletePost(false) },
          { label: '삭제', variant: 'fill', onClick: handleDeletePost },
        ]}
      />
    </div>
  )
}

export { PostDetailContent }
