'use client'

import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/shared/assets/icons'
import { Container } from '@/shared/ui'

const PostCreateHeader = () => {
  const router = useRouter()

  return (
    <Container className="tab:px-[6.25rem]">
      <header className="flex h-[3rem] items-center justify-between tab:h-[5.5rem]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
        >
          <CloseIcon className="size-5 text-text-primary" />
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold leading-[1.375rem] text-text-primary">
          글 작성
        </h1>
        {/* Spacer for center alignment */}
        <div className="size-5" />
      </header>
    </Container>
  )
}

export { PostCreateHeader }
