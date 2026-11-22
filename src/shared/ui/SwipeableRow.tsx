'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TouchEvent,
} from 'react'
import { tv } from '@/shared/lib/tv'
import { cn } from '@/shared/lib/cn'

// 목록 행을 오른쪽 → 왼쪽으로 밀면 뒤에 숨은 액션 버튼이 드러난다 (채팅방 차단·나가기).
// - 손가락(touch) 입력만 듣는다. 마우스 쓰는 PC 는 호출부가 호버 메뉴를 따로 둔다
// - touch-pan-y: 세로 스크롤은 브라우저가 그대로 처리하고, 가로로 민 것만 여기서 받는다
// - 왼쪽으로 미는 것만 연다. 화면 왼쪽 가장자리에서 시작한 터치는 iOS 뒤로가기 제스처라 무시한다
// - 열린 행은 행 바깥을 누르거나 화면이 스크롤되면 닫힌다. 한 번에 한 행만 여는 건 호출부가 open 을 하나만 준다
const swipeAction = tv({
  base: 'flex h-full w-[4.5rem] items-center justify-center text-sm font-semibold focus-ring',
  variants: {
    tone: {
      neutral: 'bg-neutral-200 text-neutral-850',
      danger: 'bg-error-500 text-white',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

// 아래 두 값은 레이아웃 길이가 아니라 손가락이 움직인 거리(터치 좌표, CSS px) 기준이다
const EDGE_GUARD_PX = 24
const AXIS_LOCK_PX = 8
// 민 손가락을 뗀 직후 브라우저가 만들어 내는 클릭만 막는다 (그 뒤의 진짜 탭·마우스 클릭은 통과)
const CLICK_GUARD_MS = 500

interface SwipeAction {
  label: string
  tone?: 'neutral' | 'danger'
  onClick: () => void
}

interface SwipeableRowProps {
  actions: SwipeAction[]
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

const SwipeableRow = ({ actions, open, onOpenChange, children }: SwipeableRowProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  // 액션 폭은 버튼 크기(rem)를 따른다 — 밀기 계산에 필요한 실제 폭은 그려진 크기를 재서 쓴다
  const actionsRef = useRef<HTMLDivElement>(null)
  // 손을 뗄 때 판단은 렌더를 기다리지 않고 ref 의 마지막 위치로 한다 — 빠르게 튕기면 state 가 한 박자 늦다
  const gesture = useRef<{
    x: number
    y: number
    axis: 'x' | 'y' | null
    width: number
    offset: number
  }>(null)
  const swipeEndedAt = useRef(0)
  const [dragX, setDragX] = useState<number | null>(null)
  // 끄는 중에는 손가락 위치(px) 그대로, 놓은 뒤에는 열림(-액션 폭 100%)·닫힘(0) 으로 맞춘다
  const transform =
    dragX !== null
      ? `translateX(${dragX}px)`
      : open
        ? 'translateX(calc(-1 * var(--swipe-actions)))'
        : 'none'

  // 열린 동안: 행 바깥을 누르거나 화면이 스크롤되면 닫는다
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false)
    }
    const close = () => onOpenChange(false)
    document.addEventListener('pointerdown', closeOutside, true)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', closeOutside, true)
      window.removeEventListener('scroll', close, true)
    }
  }, [open, onOpenChange])

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (event.touches.length > 1 || !touch) return
    const width = actionsRef.current?.offsetWidth ?? 0
    gesture.current = {
      x: touch.clientX,
      y: touch.clientY,
      // 왼쪽 가장자리는 iOS 뒤로가기 몫 — 처음부터 세로로 잠가 가로 밀기를 받지 않는다
      axis: touch.clientX < EDGE_GUARD_PX ? 'y' : null,
      width,
      offset: open ? -width : 0,
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    const current = gesture.current
    const touch = event.touches[0]
    if (!current || !touch) return
    const dx = touch.clientX - current.x
    const dy = touch.clientY - current.y
    if (!current.axis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return
      current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (current.axis !== 'x') return
    const base = open ? -current.width : 0
    current.offset = Math.min(0, Math.max(-current.width, base + dx))
    setDragX(current.offset)
  }

  const handleTouchEnd = () => {
    const current = gesture.current
    if (current?.axis === 'x') {
      swipeEndedAt.current = Date.now()
      onOpenChange(current.offset < -current.width / 2)
    }
    gesture.current = null
    setDragX(null)
  }

  return (
    <div
      ref={rootRef}
      className="relative touch-pan-y overflow-hidden"
      // 액션 버튼 한 칸 4.5rem × 개수 — 열린 위치(transform)가 같은 값을 쓴다
      style={{ '--swipe-actions': `${actions.length * 4.5}rem` } as CSSProperties}
    >
      {/* 닫혀 있으면 키보드·낭독기에서 빠진다 (마우스·키보드 사용자는 호출부 메뉴를 쓴다) */}
      <div
        ref={actionsRef}
        className="absolute inset-y-0 right-0 flex w-(--swipe-actions)"
        inert={!open}
        aria-hidden={!open}
      >
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={swipeAction({ tone: action.tone })}
            onClick={() => {
              onOpenChange(false)
              action.onClick()
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
      <div
        className={cn('relative bg-white', dragX === null && 'transition-transform duration-200')}
        style={{ transform }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        // 밀다가 손을 뗀 탭, 또는 열린 행을 누른 탭은 행 안의 링크·버튼으로 넘기지 않고 닫기만 한다
        onClickCapture={(event) => {
          const justSwiped = Date.now() - swipeEndedAt.current < CLICK_GUARD_MS
          if (justSwiped || open) {
            event.preventDefault()
            event.stopPropagation()
            if (open && !justSwiped) onOpenChange(false)
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { SwipeableRow, type SwipeAction }
