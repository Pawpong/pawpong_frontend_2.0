'use client'

import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/shared/assets/icons'
import { Container } from '@/shared/ui'

const PostCreateHeader = () => {
  const router = useRouter()

  return (
    <Container className="tab:px-[6.25rem]">
      <header className="flex h-[3rem] items-center gap-[0.625rem] tab:h-[5.5rem] tab:justify-between tab:gap-0">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
        >
          <CloseIcon className="size-5 text-text-primary" />
        </button>
        <h1 className="text-sm font-semibold leading-[1.5] text-text-primary tab:flex-1 tab:text-center tab:text-xl tab:leading-[1.375rem]">
          <span className="tab:hidden">게시글 작성</span>
          <span className="hidden tab:inline">글 작성</span>
        </h1>
        {/* Spacer for center alignment — desktop only */}
        <div className="hidden size-5 tab:block" />
      </header>
    </Container>
  )
}

export { PostCreateHeader }
