'use client'

import { BreederLevelBadge, type BreederLevel } from '@/entities/gamification'
import { Badge, MediaCard } from '@/shared/ui'
import { formatJoinedBreederLocation } from '@/shared/lib/formatBreederLocation'
import { FavoriteBreederIconButton } from './FavoriteBreederIconButton'
import type { FavoriteBreeder } from '@/shared/types'

interface BreederCardProps {
  level?: BreederLevel | null
  breeder: FavoriteBreeder
  showPopularBadge?: boolean
  preload?: boolean
}

/** 브리더 카드 — 즐겨찾기 탭·브리더 탐색 공용. 모양은 MediaCard 가 정하고 여기서는 내용만 넘긴다. */
const BreederCard = ({ breeder, level, showPopularBadge, preload = false }: BreederCardProps) => (
  <MediaCard
    href={`/home/${breeder.id}`}
    thumbnailUrl={breeder.imageUrl ?? undefined}
    alt={breeder.nickname}
    title={breeder.nickname}
    description={formatJoinedBreederLocation(breeder.location)}
    titleLeading={<BreederLevelBadge level={level} iconOnly />}
    badge={
      showPopularBadge && (
        <Badge variant="primaryOutline" size="responsive">
          인기
        </Badge>
      )
    }
    preload={preload}
    action={
      <FavoriteBreederIconButton
        breederId={breeder.id}
        isFavorited={!!breeder.isFavorited}
        size="card"
      />
    }
  />
)

export { BreederCard }
