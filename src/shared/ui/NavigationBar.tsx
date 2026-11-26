import type { ReactNode } from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { ArrowBackIcon, CloseIcon } from '@/shared/assets'
import { TextLabel } from './TextLabel'
import { IconButton, iconButtonVariants } from './IconButton'

interface NavigationBarProps {
  title: string
  /** 하단 탭 루트 화면 (RootHeader 전용): 앱에서만 52px 높이·왼쪽 제목·뒤로가기 숨김, 웹은 가운데 제목 */
  appRoot?: boolean
  /** 지정 시 mo 에서만 이 문구를 쓴다 (tab+ 는 title) */
  mobileTitle?: string
  /** 뒤로가기 링크 (없으면 화살표 미표시) */
  backHref?: string
  /** 링크 대신 동작이 필요할 때 (모달 닫기 등). backHref보다 우선 */
  onBack?: () => void
  /** 선두 아이콘 — 작성 화면처럼 '닫기' 성격이면 close (Figma 3134-385127 인스턴스) */
  icon?: 'arrow' | 'close'
  /** 오른쪽 액션 슬롯 (아이콘 버튼 등) */
  right?: ReactNode
  /** 타이틀 타이포 — page 는 브랜드 서체(최상위 화면). 미세 조정은 titleClassName 으로 */
  titleVariant?: VariantProps<typeof navigationTitle>['variant']
  /** 제목 정렬 — start: 닫기 아이콘 바로 옆에 붙인다 (커뮤니티 글쓰기) */
  titleAlign?: VariantProps<typeof navigationTitle>['align']
  titleClassName?: string
  /**
   * default: 내용 높이 + 위아래 여백 (서브 화면)
   * top: 로고 바를 대신해 맨 위에 붙는 52px 한 줄 (채팅 목록·공개 홈 모바일)
   */
  height?: 'default' | 'top'
  /** 바 밑 여백 — tight: 바로 아래 내용과 한 덩어리인 글쓰기 화면 (globals.css data-gap) */
  gap?: 'default' | 'tight'
  /** 배치용 (page-shell·sticky·노출 구간) — 모양은 variant 로 정한다 */
  className?: string
}

const BAR_HEIGHT = { default: 'py-1 tab:py-2', top: 'h-13' } as const

// [refactored] 브랜드 타이틀 클래스가 호출부 네 곳에 복제되며 세 가지 값으로 갈라져 있었다
// (마이홈은 pc 없음 / 커뮤니티·명예의전당은 pc:text-2xl / 공지사항은 모바일부터 2xl).
const navigationTitle = tv({
  base: 'min-w-0 flex-1 truncate',
  variants: {
    align: {
      center: 'text-center',
      start: 'pl-3 text-left',
    },
    variant: {
      /** 서브 화면 — Figma: medium(mo) 14 / large(tab+) 16. 라벨 높이가 바 높이(33/44)를 정한다 */
      default: 'text-sm tab:text-base',
      /** 하단 네비로 오가는 최상위 화면 (마이홈·커뮤니티·명예의 전당·공지사항) */
      page: 'font-cafe24 text-lg text-neutral-850 tab:text-xl pc:text-2xl',
    },
  },
  defaultVariants: { variant: 'default', align: 'center' },
})

/** 서브 페이지 상단바 (가운데 정렬 타이틀 + 옵션 뒤로가기/오른쪽 액션) — Figma node 976:25817 · 2046:160967 */
const NavigationBar = ({
  title,
  appRoot = false,
  mobileTitle,
  backHref,
  onBack,
  icon = 'arrow',
  right,
  titleVariant,
  titleAlign,
  titleClassName,
  height = 'default',
  gap = 'default',
  className,
}: NavigationBarProps) => {
  const isClose = icon === 'close'
  // X 는 24 칸 안 6~18 에만 그려져 있어 둘레 빈칸(6px)을 잘라 그림 크기(12px) 그대로 둔다 —
  // 그래야 음수 여백 없이 X 왼쪽 끝이 아래 내용의 왼쪽 끝과 맞는다 (그림 크기·굵기는 24 칸일 때와 같다)
  const backIcon = isClose ? (
    <CloseIcon viewBox="6 6 12 12" className="size-3" />
  ) : (
    <ArrowBackIcon className="size-6" />
  )
  const backSize = isClose ? 'size-3' : 'size-6'
  const backLabel = isClose ? '닫기' : '뒤로 가기'
  // [refactored] 중첩 삼항/중복 조건을 명명 조건으로
  const hasBack = Boolean(onBack || backHref)

  return (
    // 화면 맨 위 제목 바(data-page-top) — 폭·여백은 페이지 틀이 정하고, 틀 위 여백 자리에 붙는다.
    // 틀 밖(띠 페이지)에서 쓸 때는 감싸는 쪽이 PageShell 로 여백을 준다.
    <div
      data-page-top
      data-root-header={appRoot || undefined}
      data-gap={gap === 'tight' ? gap : undefined}
      className={cn(
        'flex items-center bg-white',
        BAR_HEIGHT[height],
        appRoot && 'in-data-app:h-13 in-data-app:py-0',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {hasBack && (
          // flex: 버튼(inline-flex)이 글줄 기준선에 얹혀 제목보다 3~4px 위로 뜨지 않게
          <div className={cn('flex', appRoot && 'in-data-app:hidden')}>
            {onBack ? (
              <IconButton size="fit" onClick={onBack} aria-label={backLabel}>
                {backIcon}
              </IconButton>
            ) : (
              backHref && (
                <Link
                  href={backHref}
                  aria-label={backLabel}
                  className={iconButtonVariants({ size: 'fit' })}
                >
                  {backIcon}
                </Link>
              )
            )}
          </div>
        )}
        {/* 웹 루트 화면에 뒤로가기가 없으면 오른쪽 아이콘(24px) 폭만큼 왼쪽을 채워 제목을 가운데로 */}
        {appRoot && !hasBack && right && <div className="size-6 in-data-app:hidden" />}
        <TextLabel
          className={cn(
            navigationTitle({ variant: titleVariant, align: titleAlign }),
            appRoot && 'in-data-app:text-left',
            titleClassName,
          )}
        >
          {mobileTitle ? (
            <>
              <span className="tab:hidden">{mobileTitle}</span>
              <span className="hidden tab:inline">{title}</span>
            </>
          ) : (
            title
          )}
        </TextLabel>
        {/* 오른쪽 액션이 없으면 뒤로가기 아이콘 폭만큼 자리를 채워 타이틀을 실제 가운데로 */}
        {right || (hasBack && <div className={backSize} />)}
      </div>
    </div>
  )
}

export { NavigationBar }
