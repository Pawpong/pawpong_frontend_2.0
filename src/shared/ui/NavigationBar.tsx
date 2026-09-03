import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { ArrowBackIcon, CloseIcon } from '@/shared/assets'
import { Container } from './Container'
import { TextLabel } from './TextLabel'

interface NavigationBarProps {
  title: string
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
  /** 타이틀 타이포 오버라이드 (브랜드 디스플레이 서체 등) */
  titleClassName?: string
  className?: string
}

/** 서브 페이지 상단바 (가운데 정렬 타이틀 + 옵션 뒤로가기/오른쪽 액션) — Figma node 976:25817 · 2046:160967 */
const NavigationBar = ({
  title,
  mobileTitle,
  backHref,
  onBack,
  icon = 'arrow',
  right,
  titleClassName,
  className,
}: NavigationBarProps) => {
  const isClose = icon === 'close'
  const Icon = isClose ? CloseIcon : ArrowBackIcon
  const backIcon = <Icon className="size-6 text-neutral-850" />
  const backLabel = isClose ? '닫기' : '뒤로 가기'
  // [refactored] 중첩 삼항/중복 조건을 명명 조건으로
  const hasBack = Boolean(onBack || backHref)

  return (
    // 좌우 여백은 공통 Container(tab 48 / pc 80) 사용, 모바일만 16으로 오버라이드
    <Container className={cn('flex items-center bg-white px-4 py-1 tab:py-2', className)}>
      <div className="flex min-w-0 flex-1 items-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="-m-2 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {backIcon}
          </button>
        )}
        {!onBack && backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-m-2 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {backIcon}
          </Link>
        )}
        {/* Figma: medium(mo) 14 / large(tab+) 16 — 라벨 높이가 바 높이(33/44)를 결정한다 */}
        <TextLabel
          className={cn(
            'min-w-0 flex-1 truncate text-center text-sm tab:text-base',
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
        {right ? (
          <div className="shrink-0">{right}</div>
        ) : (
          hasBack && <div className="size-6 shrink-0" aria-hidden />
        )}
      </div>
    </Container>
  )
}

export { NavigationBar }
