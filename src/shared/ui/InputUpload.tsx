import type { ReactNode } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { Container } from './Container'

interface InputUploadProps {
  /** 버튼 문구 */
  text: string
  /** 이동 경로 */
  href: string
  /** 같은 줄 왼쪽에 놓을 보조 액션 (임시저장 이어쓰기 등) — 없으면 버튼만 오른쪽에 붙는다 */
  left?: ReactNode
  /** 보조 액션이 없을 때 주 액션의 맥락을 설명하는 한 줄 */
  description?: string
  /** Container에 적용 — 좌우 여백을 주변 콘텐츠에 맞출 때 사용 */
  className?: string
}

/**
 * 작성 진입 줄. 떠 있는 알약 버튼 대신 흰 표면 안에 보조 맥락과 포인트 액션을 함께 둔다.
 * 주 액션은 오른쪽 끝, 보조 액션은 같은 줄 왼쪽에 둬 진입점이 위아래로 쌓이지 않게 한다.
 */
const InputUpload = ({ text, href, left, description, className }: InputUploadProps) => {
  return (
    <Container className={cn('py-3', className)}>
      <div className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-neutral-150 bg-white p-2 pl-3 tab:min-h-16 tab:p-3 tab:pl-4">
        <div className="min-w-0 flex-1">
          {left ||
            (description && (
              <p className="truncate text-xs leading-[1.5] font-medium text-neutral-700 tab:text-sm">
                {description}
              </p>
            ))}
        </div>
        <Link
          href={href}
          className="group flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-point-500 px-3 text-sm leading-[1.5] font-semibold whitespace-nowrap text-neutral-850 transition-colors hover:bg-point-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:bg-point-600 tab:px-4 tab:text-base"
        >
          <PlusIcon className="size-5" aria-hidden="true" />
          {text}
        </Link>
      </div>
    </Container>
  )
}

export { InputUpload }
