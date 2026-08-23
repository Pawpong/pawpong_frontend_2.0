'use client'

import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/shared/assets'
import { Container } from '@/shared/ui'

interface PostFormHeaderProps {
  title: string
  mobileTitle?: string
  /** 본문 여백이 Container 기본과 다른 화면에서 헤더를 맞추기 위한 오버라이드 */
  className?: string
}

const PostFormHeader = ({ title, mobileTitle, className }: PostFormHeaderProps) => {
  const router = useRouter()

  return (
    <Container className={className}>
      <header className="flex h-[3rem] items-center gap-[0.625rem] tab:h-[5.5rem] tab:justify-between tab:gap-0">
        <button type="button" onClick={() => router.back()} aria-label="닫기">
          <CloseIcon className="size-5 text-text-primary" />
        </button>
        <h1 className="text-sm leading-[1.5] font-semibold text-text-primary tab:flex-1 tab:text-center tab:text-xl tab:leading-[1.375rem]">
          {mobileTitle ? (
            <>
              <span className="tab:hidden">{mobileTitle}</span>
              <span className="hidden tab:inline">{title}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {/* Spacer for center alignment — desktop only */}
        <div className="hidden size-5 tab:block" />
      </header>
    </Container>
  )
}

export { PostFormHeader }
