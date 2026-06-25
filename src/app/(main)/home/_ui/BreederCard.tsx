'use client'

import { useState, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { LocationOnIcon, PixelStarIcon } from '@/shared/assets/icons'
import type { FavoriteBreeder } from '@/shared/mocks/myHome'

interface BreederCardProps {
  breeder: FavoriteBreeder
  showPopularBadge?: boolean
}

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

  const starColor = favorited ? 'text-[#fffa94]' : 'text-[#a6a6a6]'

  return (
    <Link href={`/home/${breeder.id}`} className="flex flex-col">
      {/* 이미지: 인기 뱃지(좌상단) / 모바일 별(우하단) */}
      <div className="relative aspect-[282/230] w-full overflow-hidden rounded bg-[#6b6b6b] tab:rounded-lg">
        {breeder.imageUrl && (
          <Image src={breeder.imageUrl} alt={breeder.nickname} fill className="object-cover" />
        )}
        {showPopularBadge && (
          <Badge
            variant="default"
            size="md"
            className="absolute top-2.5 left-2.5 tab:top-3.5 tab:left-3.5 tab:h-auto tab:py-1 tab:text-base"
          >
            인기
          </Badge>
        )}
        {/* 모바일 전용 별 오버레이 (PC는 정보 영역의 즐겨찾기 행) */}
        <button
          type="button"
          aria-label="즐겨찾기"
          aria-pressed={favorited}
          onClick={toggleFavorite}
          className="absolute right-0 bottom-0 tab:hidden"
        >
          <PixelStarIcon className={cn('size-12', starColor)} />
        </button>
      </div>

      {/* 정보 */}
      <div className="flex flex-col gap-2 p-2 tab:min-h-[7.5625rem] tab:justify-between tab:p-3">
        {/* 이름/위치 + 분양중 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            {/* 디자인(926-25250): 라벨 16px semibold #3e3e3e (p-2px) */}
            <span className="truncate p-0.5 text-base leading-[1.5] font-semibold text-[#3e3e3e]">
              {breeder.nickname}
            </span>
            <div className="flex items-center">
              <LocationOnIcon className="size-6 shrink-0 text-[#6b6b6b]" />
              <span className="truncate text-xs leading-[1.5] font-medium text-[#6b6b6b]">
                {breeder.location}
              </span>
            </div>
          </div>
          {breeder.isBreeding && (
            <Badge
              variant="active"
              size="md"
              className="shrink-0 tab:h-auto tab:py-1 tab:text-base"
            >
              분양중
            </Badge>
          )}
        </div>

        {/* PC 전용: 즐겨찾기 (별 + 텍스트, 우측 정렬) */}
        <button
          type="button"
          aria-pressed={favorited}
          onClick={toggleFavorite}
          className="hidden items-center self-end tab:flex"
        >
          <PixelStarIcon className={cn('size-8', starColor)} />
          <span className="text-xs leading-[1.5] font-semibold text-[#3e3e3e]">즐겨찾기</span>
        </button>
      </div>
    </Link>
  )
}

export { BreederCard }
