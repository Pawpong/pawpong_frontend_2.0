import type { ReactNode } from 'react'
import Link from 'next/link'
import { TEXT } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { PlusIcon } from '@/shared/assets'
import { iconButtonVariants } from './IconButton'

interface ListHeaderProps {
  title: string
  /** 제목 옆 전체 개수. 없으면 숨긴다 (조회 전 등) */
  count?: number
  /** 개수 단위 — 글은 '건', 사진은 '장' */
  unit?: string
  /** 제목 줄 오른쪽 + 버튼 (새 글 쓰기·새 사진 만들기). label 은 낭독기용 */
  create?: { href: string; label: string }
  /** 제목 아래 필터·정렬 줄. 아래 구분선과 함께 그린다 */
  children?: ReactNode
}

/** 마이홈 목록 탭(분양 목록·게시글·AI 사진) 위의 '제목 n건' + 필터 줄. */
const ListHeader = ({ title, count, unit = '건', create, children }: ListHeaderProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex min-w-0 items-center gap-2">
      <h2 className={TEXT.section}>{title}</h2>
      {count !== undefined && (
        <span className="text-sm font-normal text-neutral-500">
          {count.toLocaleString('ko-KR')}
          {unit}
        </span>
      )}
      {create && (
        <Link
          href={create.href}
          aria-label={create.label}
          className={cn('ml-auto', iconButtonVariants({ tone: 'brand', size: 'sm', edge: 'end' }))}
        >
          <PlusIcon aria-hidden className="size-6" />
        </Link>
      )}
    </div>
    {children && (
      <div className="flex flex-col gap-2 border-b border-neutral-200 pb-2">{children}</div>
    )}
  </div>
)

export { ListHeader }
