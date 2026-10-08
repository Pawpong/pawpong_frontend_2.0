'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { CameraIcon, PixelArrowRightIcon, ShareIcon } from '@/shared/assets'
import { Button, buttonVariants } from '@/shared/ui/Button'
import { Textarea } from '@/shared/ui/Textarea'
import { PLAY_SHARE_MESSAGES, sharePlayCard } from '../lib/sharePlayCard'
import { memoryCardHref, playCardText } from '../model/discovery'
import type { PlayCard } from '../model/discovery.types'
import { currentToolOwner } from '../model/useToolOwner'

type NextPlay = { href: string; title: string; detail: string }

// 결과 다음에 이어갈 놀이. 첫 화면과 같은 순서(사진 → 방 → 기록)를 유지한다.
function nextPlays(from: 'outing' | 'taste'): NextPlay[] {
  return [
    {
      href: '/ai-filter',
      title: 'AI 사진 만들기',
      detail: '오늘의 사진을 도트·스티커 그림으로',
    },
    {
      href: '/playground/pet',
      title: '우리 아이 방에 놀러가기',
      detail: '캐릭터와 놀고 방을 꾸며요',
    },
    from === 'outing'
      ? {
          href: '/community/write?experience=walk',
          title: '다녀온 곳 사진으로 나누기',
          detail: '위치는 확인한 장소만 공개돼요',
        }
      : {
          href: '/playground/walk-card',
          title: '오늘의 산책 뽑기',
          detail: '분위기에 맞는 놀이 카드를 뽑아요',
        },
  ]
}

export function PlayResultActions({
  card,
  owner,
  from,
}: {
  card: PlayCard
  owner: string
  from: 'outing' | 'taste'
}) {
  const [status, setStatus] = useState('')
  const [fallback, setFallback] = useState(false)
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  const text = playCardText(card)
  const current = () => alive.current && currentToolOwner() === owner

  async function share() {
    if (busy.current || !current()) return
    busy.current = true
    setPending(true)
    setStatus('')
    try {
      const outcome = await sharePlayCard(navigator, { title: card.title, text })
      if (!current()) return
      if (outcome === 'fallback') setFallback(true)
      setStatus(PLAY_SHARE_MESSAGES[outcome])
    } finally {
      busy.current = false
      if (current()) setPending(false)
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <div>
        <div className="flex flex-col gap-3 tab:flex-row">
          <Link
            href={memoryCardHref(card)}
            className={cn(buttonVariants({ width: 'full' }), 'tab:w-auto')}
          >
            <CameraIcon aria-hidden className="mr-2 size-5" />
            추억 카드로 남기기
          </Link>
          <div className="tab:w-auto">
            <Button intent="secondary" width="full" onClick={() => void share()} disabled={pending}>
              <ShareIcon aria-hidden className="mr-2 size-4" />
              {pending ? '공유 준비 중' : '카드 공유하기'}
            </Button>
          </div>
        </div>
        <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-neutral-700">
          {status}
        </p>
      </div>
      {fallback && (
        <label className="block text-sm font-semibold text-neutral-850">
          공유할 카드 내용
          <Textarea
            readOnly
            value={text}
            rows={8}
            className="mt-2 h-48"
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
      <nav aria-label="이어서 놀기" className="border-t border-secondary-200 pt-5">
        <h3 className="text-sm font-semibold text-neutral-850">이어서 놀아볼까요?</h3>
        <ul className="mt-3 grid gap-2 tab:grid-cols-3">
          {nextPlays(from).map((next) => (
            <li key={next.href}>
              <Link
                href={next.href}
                className="flex min-h-16 items-center justify-between gap-2 rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 focus-ring transition-colors hover:bg-point-100"
              >
                <span>
                  <span className="block text-sm font-semibold text-neutral-850">{next.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 break-keep text-neutral-700">
                    {next.detail}
                  </span>
                </span>
                <PixelArrowRightIcon aria-hidden className="size-3 shrink-0 text-primary-500" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
