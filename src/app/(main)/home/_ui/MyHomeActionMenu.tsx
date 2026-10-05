'use client'

import Link from 'next/link'
import {
  IconButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'
import { PlusIcon } from '@/shared/assets/icons'

// [refactored] 같은 Link 메뉴 항목 5개 나열 → 배열 + map
const MENU_ITEMS = [
  { href: '/adoption/create', label: '새로운 분양글 등록', breederOnly: true },
  { href: '/community/write', label: '게시글 등록' },
  { href: '/drafts', label: '임시저장한 글' },
  { href: '/ai-filter', label: 'AI 필터로 만들기' },
  { href: '/profile/edit', label: '프로필 수정' },
]

/** 마이홈 작성·수정 진입점 — 모바일은 상단 바, 2단(tab+)은 프로필 카드 우상단에 둔다 */
const MyHomeActionMenu = ({ isBreeder }: { isBreeder: boolean }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <IconButton tone="brand" aria-label="마이홈 작성 및 수정 메뉴">
        <PlusIcon aria-hidden className="size-7.5" />
      </IconButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} collisionPadding={16} className="min-w-48">
      {MENU_ITEMS.filter((item) => isBreeder || !item.breederOnly).map((item) => (
        <DropdownMenuItem key={item.href} asChild>
          <Link href={item.href}>{item.label}</Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

export { MyHomeActionMenu }
