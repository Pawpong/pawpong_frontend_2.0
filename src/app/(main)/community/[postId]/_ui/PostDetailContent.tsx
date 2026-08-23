'use client'

import Image from 'next/image'
import Link from 'next/link'
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
import { CloseIcon, FavoriteIcon, PixelMessageIcon, PixelBookmarkIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { usePostDetail } from './usePostDetail'
import { CommentSection } from './CommentSection'
import { PostDetailPanel } from '../../_ui/PostDetailPanel'

// [refactored] 반복되던 섹션 좌우 패딩(모바일 0 / tab 50px)을 상수로 추출
const SECTION_X = 'px-0 tab:px-[3.125rem]'

interface PostDetailContentProps {
  postId: string
}

const PostDetailContent = ({ postId }: PostDetailContentProps) => {
  // 최은진: 이 컴포넌트 안에 직접 있던 데이터 조회(useQuery)·좋아요/북마크/삭제 로직을
  // usePostDetail 훅으로 전부 뽑아냈다 — 모달(PostDetailModalBody)도 같은 로직을 쓰기 위함.
  const {
    router,
    post,
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
  // 최은진: mo(~767) 전용 레이아웃 분기 — PostDetailModal이 mo에서는 모달 대신 이 페이지로
  // window.location.replace 해오므로, mo에서 이 컴포넌트가 곧 "피드 상세" 화면이 된다.
  // tab·pc(직접 URL 접근 시의 기존 카드형 레이아웃)는 아래 이 분기 밖에서 그대로 둔다.
  const isTabUp = useBreakpoint('tab')

  if (!post) return null

  // 최은진: Figma "feed-detail" 컴포넌트(node 3753:246802)의 device=tab-mo 베리언트를
  // tab 모달과 완전히 동일하게 반영 — PostDetailPanel(공용, PostDetailModalBody가 tab에서
  // 쓰는 것과 같은 컴포넌트)을 그대로 재사용하고, 모달이 아니라 실제 페이지이므로 트레일링
  // 아이콘만 닫기(X) 대신 뒤로가기로 바꿨다. h-dvh로 뷰포트 전체를 채워 헤더/이미지/캡션/
  // 액션바는 고정되고 댓글 영역만 스크롤되는, 모달과 동일한 인터랙션을 페이지에서도 유지한다.
  if (!isTabUp) {
    // 최은진: 뒤로가기 화살표 → tab 모달과 동일한 닫기(X) 아이콘으로 교체. 클릭 시 동작(피드로
    // 복귀)은 그대로고, 아이콘만 tab 모달의 트레일링 아이콘과 시각적으로 통일했다.
    const backButton = (
      <Link
        href="/community"
        aria-label="닫기"
        className="shrink-0 rounded-full p-1 text-text-primary hover:bg-fill-muted"
      >
        <CloseIcon className="size-6" />
      </Link>
    )

    // 최은진: h-dvh를 바로 쓰면 상위 (main)/layout.tsx의 sticky Gnb 헤더(mo에서 size-12=3rem
    // 고정 높이, data-gnb) 만큼 문서 전체 높이가 뷰포트를 초과해서 페이지 자체가 스크롤돼버린다
    // (댓글 영역만 스크롤되는 모달과 다른 인터랙션이 됨) — Gnb 높이를 뺀 나머지만 채운다.
    return (
      <PostDetailPanel
        postId={postId}
        layout="stacked"
        trailingAction={backButton}
        className="h-[calc(100dvh-3rem)]"
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
                // 최은진: 게시글 본문 스타일 font-bold/text-text-secondary → font-semibold/text-neutral-850로
                // 교체 — 댓글(CommentItem) 본문과 동일한 톤으로 통일
                contentSlot={
                  <p className="mt-1 text-sm font-semibold whitespace-pre-wrap text-neutral-850">
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
        isPending={isDeletePending}
      />
    </div>
  )
}

export { PostDetailContent }
