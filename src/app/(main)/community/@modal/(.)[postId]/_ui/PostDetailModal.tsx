'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { PostDetailModalBody } from './PostDetailModalBody'

interface PostDetailModalProps {
  postId: string
}

/**
 * 인스타그램 웹의 댓글 아이콘 클릭 로직: 피드는 그대로 뒤에 남겨두고 상세를 큰 모달로 띄운다.
 * 닫으면(X 버튼·바깥 클릭·ESC 모두 onOpenChange로 들어온다) 오던 자리로 돌아간다.
 *
 * 공용 Dialog(shared/ui)를 안 쓰고 radix primitive를 직접 쓰는 이유: 공용 Dialog는 z-50 고정인데
 * 사이트 상단 헤더(<header>)도 sticky z-50이라 겹치면 배경이 어두워지지 않는 스태킹 충돌이 있었다.
 * 이 파일은 community 페이지 전용이라 여기서만 z를 더 높여 해결한다 (공용 컴포넌트는 건드리지 않음).
 */
const PostDetailModal = ({ postId }: PostDetailModalProps) => {
  const router = useRouter()

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && router.back()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        {/* 인스타그램 웹 상세 모달 크기감: 데스크톱에서 뷰포트를 거의 채우는 큰 카드 */}
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-[60] flex h-[94vh] max-h-[60rem] w-[calc(100%-1.5rem)] max-w-[80rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-lg data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
          <DialogPrimitive.Title className="sr-only">게시글 상세</DialogPrimitive.Title>
          <PostDetailModalBody postId={postId} />
          <DialogPrimitive.Close
            aria-label="닫기"
            className="absolute top-3 right-3 z-[61] rounded-full bg-black/40 p-1.5 text-white opacity-90 hover:opacity-100 focus:outline-none"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { PostDetailModal }
