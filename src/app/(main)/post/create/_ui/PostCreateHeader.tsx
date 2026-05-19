'use client'

import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/shared/assets/icons'

const PostCreateHeader = () => {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between px-5 py-3 tab:px-[6.25rem] tab:py-[0.625rem]">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="닫기"
      >
        <CloseIcon className="size-5 text-text-primary" />
      </button>
      <h1 className="text-xl font-semibold leading-[1.375rem] text-text-primary">
        글 작성
      </h1>
      {/* Spacer for center alignment */}
      <div className="size-5" />
    </header>
  )
}

export { PostCreateHeader }
