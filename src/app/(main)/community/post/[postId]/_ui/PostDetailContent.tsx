'use client'

import Link from 'next/link'
import { CloseIcon } from '@/shared/assets'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { PostDetailPanel } from '../../../_ui/PostDetailPanel'

interface PostDetailContentProps {
  postId: string
}

const closeButton = (
  <Link
    href="/community"
    aria-label="닫기"
    className="-mr-2 flex size-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-500"
  >
    <CloseIcon className="size-5" />
  </Link>
)

/**
 * 인터셉트되지 않은 직접 진입(공유 링크·새로고침)용 — 모달(PostDetailDialog)과 같은
 * PostDetailPanel을 그대로 쓴다. 예전에는 이 화면만 따로 구현돼 모달과 디자인이 어긋나 있었다.
 * mo는 페이지 전체를 채우고, tab+는 모달과 같은 카드 표면 안에 둔다.
 */
const PostDetailContent = ({ postId }: PostDetailContentProps) => {
  const isTabUp = useBreakpoint('tab')
  const isLapUp = useBreakpoint('lap')

  if (!isTabUp) {
    // 상위 레이아웃의 sticky Gnb(mo 3rem)를 뺀 나머지를 채워야 페이지 자체가 스크롤되지 않고
    // 모달과 동일하게 본문 영역만 스크롤된다
    return (
      <PostDetailPanel
        postId={postId}
        layout="stacked"
        trailingAction={closeButton}
        className="h-[calc(100dvh-3rem)]"
      />
    )
  }

  // tab+ — 모달(PostDetailDialog)과 같은 카드 표면 위에 같은 본문을 그린다
  return (
    <div className="flex justify-center px-12 py-10">
      <div className="flex h-[min(44rem,calc(100dvh-7rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-neutral-150 bg-white shadow-lg">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-6">
          <p className="font-cafe24 text-body-xl text-primary-700">게시글</p>
          {closeButton}
        </header>
        <PostDetailPanel
          postId={postId}
          layout={isLapUp ? 'side-by-side' : 'stacked'}
          className="min-h-0 flex-1"
        />
      </div>
    </div>
  )
}

export { PostDetailContent }
