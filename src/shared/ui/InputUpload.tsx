import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { buttonVariants } from './Button'
import { Container } from './Container'

interface InputUploadProps {
  /** 버튼 문구 */
  text: string
  /** 이동 경로 */
  href: string
  /** 같은 줄 왼쪽에 놓을 보조 액션 (임시저장 이어쓰기 등) — 없으면 버튼만 오른쪽에 붙는다 */
  left?: ReactNode
  /** Container에 적용 — 좌우 여백을 주변 콘텐츠에 맞출 때 사용 */
  className?: string
}

/**
 * 작성 진입 줄.
 * 주 액션은 오른쪽 끝, 보조 액션은 같은 줄 왼쪽에 둬 진입점이 위아래로 쌓이지 않게 한다.
 * 버튼은 입양 신청하기와 같은 공통 BaseButton primary(포인트 옐로우 알약)를 쓴다.
 */
const InputUpload = ({ text, href, left, className }: InputUploadProps) => {
  return (
    <Container className={cn('flex items-center justify-between gap-3 py-3', className)}>
      {/* 보조 액션이 없어도 버튼이 오른쪽에 남도록 자리를 채운다 */}
      {left ?? <span />}
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: 'primary', size: 'sm' }),
          'shrink-0 px-4 whitespace-nowrap tab:h-10 tab:px-5 tab:text-base',
        )}
      >
        {text}
      </Link>
    </Container>
  )
}

export { InputUpload }
