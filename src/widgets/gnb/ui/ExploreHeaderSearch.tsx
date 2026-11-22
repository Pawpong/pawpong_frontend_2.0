'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { CloseIcon } from '@/shared/assets'
import { IconButton, SearchIcon } from '@/shared/ui'

const PLACEHOLDER = {
  breeder: '브리더·품종·지역으로 검색',
  adoption: '검색해서 원하는 동물 찾기',
} as const

const OPEN_BUTTON_ID = 'explore-header-search'

// 탐색 화면 전용 헤더 검색 (Option 3) — 돋보기를 누르면 헤더 전체가 검색창으로 바뀐다.
// 검색어는 탐색 화면이 읽는 URL(?keyword=)에만 쓴다. 탐색 목록과는 URL 로만 이어진다.
const ExploreHeaderSearch = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const keyword = searchParams.get('keyword') ?? ''
  const type = searchParams.get('type') === 'adoption' ? 'adoption' : 'breeder'
  // 링크로 검색어를 달고 들어오면 펼친 채로 시작한다 — 보이지 않는 검색 조건을 남기지 않는다
  const [open, setOpen] = useState(Boolean(keyword))
  const [draft, setDraft] = useState(keyword)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // 다른 곳(필터 초기화·탭 전환)에서 검색어가 바뀌면 입력칸도 맞춘다 (렌더 중 이전 값과 비교)
  const [syncedKeyword, setSyncedKeyword] = useState(keyword)
  if (syncedKeyword !== keyword) {
    setSyncedKeyword(keyword)
    setDraft(keyword)
  }

  const writeKeyword = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set('keyword', next)
    else params.delete('keyword')
    const search = params.toString()
    // 탐색 화면과 같은 이유로 네이티브 history 를 쓴다 (정적 페이지의 searchParams-only 라우팅)
    window.history.pushState(null, '', search ? `${pathname}?${search}` : pathname)
  }

  // 검색을 닫으면 검색어도 푼다
  const close = () => {
    setOpen(false)
    if (keyword) writeKeyword('')
    // 닫은 뒤 키보드 포커스를 돋보기로 돌려준다
    document.getElementById(OPEN_BUTTON_ID)?.focus()
  }

  return (
    <>
      <IconButton
        id={OPEN_BUTTON_ID}
        tone="brand"
        edge="both"
        aria-label="검색"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-6" />
      </IconButton>

      {open && (
        <div className="absolute inset-0 z-10 flex items-center bg-white">
          <div className="page-shell flex items-center gap-2">
            <IconButton tone="neutral" edge="both" aria-label="검색 닫기" onClick={close}>
              <CloseIcon className="size-5" />
            </IconButton>
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                writeKeyword(draft.trim())
              }}
              className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-neutral-100 px-3"
            >
              <SearchIcon className="size-4 shrink-0 text-neutral-700" />
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                maxLength={50}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') close()
                }}
                placeholder={PLACEHOLDER[type]}
                aria-label={PLACEHOLDER[type]}
                className="h-full w-full min-w-0 bg-transparent text-sm font-medium text-neutral-850 outline-none placeholder:text-neutral-400"
              />
              {draft && (
                <IconButton
                  tone="muted"
                  size="xs"
                  shape="circle"
                  aria-label="검색어 지우기"
                  onClick={() => {
                    setDraft('')
                    if (keyword) writeKeyword('')
                    inputRef.current?.focus()
                  }}
                >
                  <CloseIcon className="size-3.5" />
                </IconButton>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export { ExploreHeaderSearch }
