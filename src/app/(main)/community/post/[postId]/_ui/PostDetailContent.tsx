'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  AsyncState,
  AuthorInfo,
  BOOKMARK_ACTIVE,
  Container,
  DeleteConfirmModal,
  NavigationBar,
  OwnerActionsMenu,
  PostActionButton,
  Button,
  Separator,
} from '@/shared/ui'
import { CloseIcon, FavoriteIcon, PixelMessageIcon, PixelBookmarkIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { CommentSection } from './CommentSection'
import { usePostDetail } from './usePostDetail'
import { PostDetailPanel } from '../../../_ui/PostDetailPanel'

// [refactored] 반복되던 섹션 좌우 패딩(모바일 0 / tab 50px)을 상수로 추출
const SECTION_X = 'px-0 tab:px-[3.125rem]'

interface PostDetailContentProps {
  postId: string
}

const PostDetailContent = ({ postId }: PostDetailContentProps) => {
  // 조회·좋아요·북마크·삭제는 모달(PostDetailPanel)과 공유하는 usePostDetail이 담당한다
  const {
    router,
    post,
    isPending,
    isError,
    refetch,
    isOwner,
    toggleLike,
    isLikePending,
    toggleBookmark,
    isBookmarkPending,
    confirmDeletePost,
    setConfirmDeletePost,
    handleDeletePost,
    isDeletePending,
  } = usePostDetail(postId)
  // mo(~767)는 모달 대신 이 페이지로 오므로, 여기서 곧바로 피드 상세 레이아웃을 그린다
  const isTabUp = useBreakpoint('tab')

  if (!isTabUp) {
    const backButton = (
      <Link
        href="/community"
        aria-label="닫기"
        className="shrink-0 rounded-full p-1 text-neutral-850 hover:bg-fill-muted"
      >
        <CloseIcon className="size-6" />
      </Link>
    )

    // 상위 레이아웃의 sticky Gnb(mo 3rem)를 뺀 나머지를 채워야 페이지 자체가 스크롤되지 않고
    // 모달과 동일하게 본문 영역만 스크롤된다
    return (
      <PostDetailPanel
        postId={postId}
        layout="stacked"
        trailingAction={backButton}
        className="h-[calc(100dvh-3rem)]"
      />
    )
  }

  if (!post) {
    return (
      <AsyncState
        status={isError ? 'error' : isPending ? 'loading' : 'empty'}
        message={
          isError
            ? '게시글을 불러오지 못했습니다.'
            : isPending
              ? '게시글을 불러오는 중입니다.'
              : '삭제되었거나 볼 수 없는 게시글입니다.'
        }
        action={
          isError ? (
            <Button variant="fill" size="sm" onClick={() => void refetch()}>
              다시 시도
            </Button>
          ) : undefined
        }
        className="min-h-[calc(100dvh-3.5rem)]"
      />
    )
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
                  onEdit={() => router.push(`/community/post/${postId}/edit`)}
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
                      sizes="(max-width: 767px) 234px, 349px"
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
        isPending={isDeletePending}
      />
    </div>
  )
}

export { PostDetailContent }
