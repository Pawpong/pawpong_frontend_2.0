import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { ArrowBackIcon } from '@/shared/assets/icons'
import { TextLabel } from './TextLabel'

interface NavigationBarProps {
  title: string
  /** 뒤로가기 링크 (없으면 화살표 미표시) */
  backHref?: string
  /** 오른쪽 액션 슬롯 (아이콘 버튼 등) */
  right?: ReactNode
  className?: string
}

/** 서브 페이지 상단바 (가운데 정렬 타이틀 + 옵션 뒤로가기/오른쪽 액션) — Figma node 976:25817 · 2046:160967 */
const NavigationBar = ({ title, backHref, right, className }: NavigationBarProps) => {
  return (
    <div
      className={cn('flex items-center bg-white px-4 py-1 tab:px-12 tab:py-2 pc:px-20', className)}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {backHref && (
          <Link href={backHref} aria-label="뒤로 가기" className="shrink-0">
            <ArrowBackIcon className="size-6 text-[#3e3e3e]" />
          </Link>
        )}
        <TextLabel className="min-w-0 flex-1 truncate text-center">{title}</TextLabel>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </div>
  )
}

export { NavigationBar }
