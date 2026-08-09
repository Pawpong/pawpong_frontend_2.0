'use client'

import { useState, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge, TextLabel } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { LocationOnIcon, PixelStarIcon } from '@/shared/assets/icons'
import type { FavoriteBreeder } from '@/shared/types'

interface BreederCardProps {
  breeder: FavoriteBreeder
  showPopularBadge?: boolean
}

// [refactored] md 뱃지 → 탭+에서 lg(16px)로 키우는 반응형 오버라이드 (인기·분양중 공용)
const BADGE_TAB_LG = 'tab:h-auto tab:py-1 tab:text-base'

// [refactored] 즐겨찾기 별 토글 — 모바일(이미지 위)·PC(즐겨찾기 행) 공용
const FavoriteStar = ({
  pressed,
  onClick,
  className,
  iconClassName,
  label,
}: {
  pressed: boolean
  onClick: (e: MouseEvent) => void
  className: string
  iconClassName: string
  label?: string
}) => (
  <button
    type="button"
    aria-label={label ? undefined : '즐겨찾기'}
    aria-pressed={pressed}
    onClick={onClick}
    className={className}
  >
    <PixelStarIcon className={cn(iconClassName, pressed ? 'text-[#fffa94]' : 'text-neutral-500')} />
    {label && <span className="text-xs leading-[1.5] font-semibold text-neutral-850">{label}</span>}
  </button>
)

/**
 * 즐겨찾는 브리더 카드 (Figma node 1023-38692 · CardStar)
 * - 모바일(medium): 이미지 위 별(우하단) + 인기/분양중 14px
 * - PC(large): 이미지엔 별 없음, 정보 하단에 "별 + 즐겨찾기" 행 + 인기/분양중 16px
 * - 별(IconStar 814-99421): default 회색 / press 노란색(#fffa94) 토글
 */
const BreederCard = ({ breeder, showPopularBadge }: BreederCardProps) => {
  // TODO: API 연동 후 실제 브리더 홈 경로로 변경
  // 로컬 UI 토글 (실데이터 연결 시 API의 즐겨찾기 여부로 초기화)
  const [favorited, setFavorited] = useState(false)

  // 카드가 Link라 별 클릭 시 이동 방지 후 토글
  const toggleFavorite = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorited((prev) => !prev)
  }

  return (
    <Link href={`/home/${breeder.id}`} className="flex flex-col">
      {/* 이미지: 인기 뱃지(좌상단) / 모바일 별(우하단) */}
      <div className="relative aspect-[282/230] w-full overflow-hidden rounded bg-neutral-700 tab:rounded-lg">
        {breeder.imageUrl && (
          <Image
            src={breeder.imageUrl}
            alt={breeder.nickname}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        )}
        {showPopularBadge && (
          <Badge
            variant="default"
            size="md"
            className={cn('absolute top-2.5 left-2.5 tab:top-3.5 tab:left-3.5', BADGE_TAB_LG)}
          >
            인기
          </Badge>
        )}
        {/* 모바일 전용 별 오버레이 (PC는 정보 영역의 즐겨찾기 행) */}
        <FavoriteStar
          pressed={favorited}
          onClick={toggleFavorite}
          className="absolute right-0 bottom-0 tab:hidden"
          iconClassName="size-12"
        />
      </div>

      {/* 정보 */}
      <div className="flex min-h-20 flex-col gap-2 p-2 tab:min-h-[7.5625rem] tab:justify-between tab:p-3">
        {/* 이름/위치 + 분양중 (모바일 items-start / PC items-center) */}
        <div className="flex items-start justify-between gap-2 tab:items-center">
          <div className="flex min-w-0 flex-col">
            {/* 카드 이름 라벨 14px semibold #3e3e3e (p-2px) */}
            <TextLabel size="14" className="truncate">
              {breeder.nickname}
            </TextLabel>
            <div className="flex items-center">
              <LocationOnIcon className="size-6 shrink-0 text-neutral-700" />
              <span className="truncate text-xs leading-[1.5] font-medium text-neutral-700">
                {breeder.location}
              </span>
            </div>
          </div>
          {breeder.isBreeding && (
            <Badge variant="active" size="md" className={cn('shrink-0', BADGE_TAB_LG)}>
              분양중
            </Badge>
          )}
        </div>

        {/* PC 전용: 즐겨찾기 (별 + 텍스트, 우측 정렬) */}
        <FavoriteStar
          pressed={favorited}
          onClick={toggleFavorite}
          className="hidden items-center self-end tab:flex"
          iconClassName="size-8"
          label="즐겨찾기"
        />
      </div>
    </Link>
  )
}

export { BreederCard }
