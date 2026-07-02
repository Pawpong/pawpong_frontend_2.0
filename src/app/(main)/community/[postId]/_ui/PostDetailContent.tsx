'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  AuthorInfo,
  Breadcrumb,
  Container,
  CtaModal,
  InfiniteScrollTrigger,
  PageHeader,
  Separator,
} from '@/shared/ui'
import { FavoriteIcon, ChatBubbleIcon } from '@/shared/assets/icons'
import { MOCK_COMMUNITY_CATEGORIES } from '@/shared/mocks/community'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import {
  useToggleCommunityPostLike,
  useCreateCommunityComment,
  useUpdateCommunityPost,
  useDeleteCommunityPost,
} from '@/features/community'
import { VisibilitySelect, type VisibilityType } from '@/widgets/post-form'
import { useAuthStatus } from '@/features/auth'
import type { CommunityComment } from '@/shared/types'
import { CategorySidebar } from '../../_ui/CategorySidebar'
import { PostActionButton } from '../../_ui/PostActionButton'
import { OwnerActionsMenu } from '../../_ui/OwnerActionsMenu'
import { CommentItem } from './CommentItem'
import { CommentComposer } from './CommentComposer'

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

  if (!post) return null

  const isOwner = !!me?.userId && me.userId === post.authorId

  // 최상위 댓글 + parentCommentId 기준 답글 그룹핑 (로드된 범위 내에서 트리 구성)
  const topLevel = comments.filter((c) => !c.parentCommentId)
  const repliesByParent = comments.reduce<Record<string, CommunityComment[]>>((acc, c) => {
    if (c.parentCommentId) (acc[c.parentCommentId] ??= []).push(c)
    return acc
  }, {})

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
      <PageHeader title="게시물" backHref="/community" />

      {/* Breadcrumb (PC only) */}
      <Container>
        <Breadcrumb
          items={['홈', '커뮤니티']}
          className="hidden pt-8 pb-4 text-sm leading-[1.375rem] font-medium tab:block"
        />
      </Container>

      {/* Main: Sidebar + Detail */}
      <Container>
        <div className="flex gap-6 pb-10 tab:pb-16">
          {/* PC Category Sidebar */}
          <CategorySidebar categories={MOCK_COMMUNITY_CATEGORIES} selected="" onSelect={() => {}} />

          {/* Post Detail Card */}
          <div className="min-w-0 flex-1">
            <div className="tab:overflow-hidden tab:rounded-2xl tab:border tab:border-border-light">
              {/* Post Header */}
              <div className="px-0 pt-[1.176rem] tab:px-[3.125rem] tab:pt-8">
                <div className="flex items-start justify-between">
                  <AuthorInfo
                    authorId={post.authorId}
                    nickname={post.authorNickname}
                    profileImageUrl={post.authorProfileImageUrl}
                    createdAt={post.createdAt}
                  />
                  {isOwner && !isEditingPost && (
                    <OwnerActionsMenu
                      onEdit={startEditPost}
                      onDelete={() => setConfirmDeletePost(true)}
                    />
                  )}
                </div>

                {/* Body — 보기 / 인라인 수정 */}
                {isEditingPost ? (
                  <div className="mt-2 flex flex-col gap-3 tab:pl-[3.0625rem]">
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
                  <p className="mt-2 text-sm font-bold text-text-secondary tab:pl-[3.0625rem]">
                    {post.body}
                  </p>
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

              {/* Actions */}
              <div className="mt-[0.763rem] flex items-center gap-[1.3125rem] px-0 tab:mt-[0.96rem] tab:px-[3.125rem]">
                <PostActionButton
                  icon={FavoriteIcon}
                  count={post.likeCount}
                  active={post.isLiked}
                  onClick={() => toggleLike.mutate(post.isLiked)}
                  disabled={toggleLike.isPending}
                />
                <PostActionButton icon={ChatBubbleIcon} count={post.commentCount} />
              </div>

              {/* Comments */}
              <Separator fullWidth className="mt-4 bg-border-light tab:mx-0 tab:w-full" />
              <div className="px-0 pb-4 tab:px-[3.125rem] tab:pb-8">
                {/* 댓글 입력 (로그인 사용자만) */}
                {isLoggedIn && (
                  <CommentComposer
                    onSubmit={handleSubmitComment}
                    isSubmitting={createComment.isPending}
                    replyingToNickname={replyTarget?.nickname}
                    onCancelReply={() => setReplyTarget(null)}
                  />
                )}

                {topLevel.map((comment) => (
                  <div key={comment.commentId}>
                    <CommentItem
                      comment={comment}
                      currentUserId={me?.userId}
                      onReply={handleReply}
                    />
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
