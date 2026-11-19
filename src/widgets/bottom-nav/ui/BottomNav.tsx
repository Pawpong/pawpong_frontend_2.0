'use client'

import { Suspense, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRoutePathname } from '@/shared/lib/useRoutePathname'
import { cn } from '@/shared/lib/cn'
import { BOTTOM_NAV } from '@/shared/config'
import { UnreadCountBadge } from '@/shared/ui'
import { useMe } from '@/features/auth'
import { shouldShowBottomNav } from '../model/visibility'
import { useChatUnreadCount } from '../model/useChatUnreadCount'
import { PILL_OVERHANG } from '../model/tabConfig'

// 기존 인라인 아이콘은 currentColor를 사용해 비활성 색상을 라벨과 동일하게 맞춘다.
const subscribeNothing = () => () => undefined
const isClient = () => true
const isServer = () => false

const BottomNavView = ({ pathname }: { pathname: string }) => {
  const { me } = useMe()
  const unreadChatCount = useChatUnreadCount() // [refactored] NativeTabSync 와 같은 조회를 훅으로
  // Suspense 안이라 늦게 하이드레이션된다. 그사이 NavBar 가 받아 둔 숫자로 첫 렌더를 그리면
  // 배지 없는 서버 HTML 과 어긋나므로, 하이드레이션이 끝난 뒤에만 배지를 보여 준다
  const hydrated = useSyncExternalStore(subscribeNothing, isClient, isServer)
  // 누르는 즉시 알약을 옮긴다 — 주소가 바뀔 때(다음 화면 로딩 뒤)까지 기다리면 한 박자 늦다.
  // 주소가 바뀌면 from 이 달라져 저절로 무시되고, 그때부터는 주소 기준으로 그린다
  const [tapped, setTapped] = useState<{ index: number; from: string } | null>(null)
  const pendingIndex = tapped?.from === pathname ? tapped.index : null
  const activeIndex = pendingIndex ?? BOTTOM_NAV.findIndex((item) => item.isActive(pathname))

  // 알약은 모든 탭이 같은 크기 — 한 칸보다 양옆으로 PILL_OVERHANG 만큼 넓어 '커뮤니티'처럼 긴 라벨도 여유 있게 감싼다.
  // 양 끝 탭에서는 캡슐 밖으로 나가지 않게 안쪽으로 붙인다.
  // 다시 그리지 않도록 스타일을 직접 바꾸고, 처음 자리 잡을 때는 미끄러지지 않게 ready 뒤에만 전환을 켠다
  const pillRef = useRef<HTMLSpanElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  useLayoutEffect(() => {
    const pill = pillRef.current
    const link = linkRefs.current[activeIndex]
    if (!pill) return
    if (!link) {
      pill.style.opacity = '0'
      return
    }
    const place = () => {
      const width = link.offsetWidth + PILL_OVERHANG * 2
      const rowWidth = link.parentElement?.offsetWidth ?? width
      const left = Math.min(Math.max(link.offsetLeft - PILL_OVERHANG, 0), rowWidth - width)
      pill.style.width = `${width}px`
      pill.style.transform = `translateX(${left}px)`
      pill.style.opacity = '1'
    }
    place()
    const frame = requestAnimationFrame(() => (pill.dataset.ready = 'true'))
    // 글꼴이 늦게 들어오거나 화면 폭이 바뀌면 칸 폭도 바뀐다
    const observer = new ResizeObserver(place)
    observer.observe(link)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [activeIndex])

  return (
    <>
      <div
        aria-hidden
        className="h-[calc(4.75rem+env(safe-area-inset-bottom))] shrink-0 pc:hidden"
      />
      {/* 밝은 유리 표면에 아이콘과 라벨의 대비를 유지하는 하단 바. 바깥 nav 는 클릭을 통과시키고 캡슐만 받는다 */}
      <nav
        aria-label="하단 주요 메뉴"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-sticky px-3 in-data-native-tabs:hidden pc:hidden"
      >
        {/* 뒤 화면이 비치는 캡슐 + 가장자리 하이라이트. 선택 탭은 같은 유리를 한 겹 더 밝게 얹은 알약 */}
        {/* iOS 26 탭 바 질감: 맑게 비치는 유리(옅은 흰색 + 흐림·채도), 위쪽 빛 반사와 아래쪽 옅은 반사, 머리카락 테두리, 떠 있는 그림자 */}
        <div className="pointer-events-auto mx-auto flex h-16 w-full max-w-[30rem] items-center rounded-full border border-white/60 bg-white/45 p-1 shadow-[0_0.5rem_1.75rem_rgb(0_0_0/0.14),0_0_0_0.03125rem_rgb(0_0_0/0.1),inset_0_0.0625rem_0.0625rem_rgb(255_255_255/0.95),inset_0_-0.0625rem_0.0625rem_rgb(255_255_255/0.4)] backdrop-blur-md backdrop-brightness-110 backdrop-saturate-200">
          <div className="relative flex h-full w-full">
            {/* 선택 알약은 하나만 두고 위치만 옮긴다. 바깥은 미끄러지고, 안쪽은 탭할 때마다
                가로로 늘었다 출렁이며 돌아온다 (key 로 애니메이션을 다시 튼다) */}
            <span
              ref={pillRef}
              aria-hidden
              className="absolute inset-y-0 left-0 opacity-0 motion-safe:data-[ready=true]:transition-[transform,width,opacity] motion-safe:data-[ready=true]:duration-500 motion-safe:data-[ready=true]:ease-[cubic-bezier(0.34,1.2,0.64,1)]"
            >
              <span
                key={activeIndex}
                className={cn(
                  // 선택 탭: 같은 유리를 한 겹 더 얹은 듯한 옅은 회색 알약 + 위쪽 빛
                  'block size-full rounded-full bg-black/[0.06] shadow-[inset_0_0.0625rem_0_rgb(255_255_255/0.7)]',
                  tapped && 'animate-tab-stretch motion-reduce:animate-none',
                )}
              />
            </span>
            {BOTTOM_NAV.map(({ href, label, bottomLabel, Icon }, index) => {
              const active = index === activeIndex
              return (
                <Link
                  key={href}
                  ref={(node) => {
                    linkRefs.current[index] = node
                  }}
                  href={href}
                  onClick={() => setTapped({ index, from: pathname })}
                  className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full text-neutral-850 focus-ring-inset transition-[scale] duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="relative flex size-7 shrink-0 items-center justify-center">
                    <Icon
                      className="size-7 shrink-0"
                      src={href === '/home' ? me?.profileImageUrl : undefined}
                      active={active}
                    />
                    {href === '/chat' && (
                      <UnreadCountBadge count={hydrated ? unreadChatCount : 0} />
                    )}
                  </span>
                  {/* iOS 26 탭 바처럼 아이콘만 보인다 — 이름은 화면 읽기용으로만 남긴다 */}
                  <span className="sr-only">{bottomLabel ?? label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}

/**
 * 하단 탭 바 — mo·tab 에서 안전 영역 위 12px에 뜬 64px 유리 캡슐. 5개 칸은 같은 폭이고 선택 알약은 모든 탭에서 같은 크기다.
 * 작성·상세·채팅방처럼 자체 하단 액션이 있는 화면에서는 렌더하지 않는다.
 */
const BottomNavContent = ({ pathname }: { pathname: string }) => {
  const searchParams = useSearchParams()
  const isChatRoom = pathname === '/chat' && searchParams.has('roomId')

  if (isChatRoom) return null

  return <BottomNavView pathname={pathname} />
}

const BottomNav = () => {
  const pathname = useRoutePathname()

  if (!shouldShowBottomNav(pathname)) return null

  return (
    <Suspense fallback={pathname === '/chat' ? null : <BottomNavView pathname={pathname} />}>
      <BottomNavContent pathname={pathname} />
    </Suspense>
  )
}

export { BottomNav }
