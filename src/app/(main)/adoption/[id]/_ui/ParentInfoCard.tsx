import Image from 'next/image'
import { Badge } from '@/shared/ui'
import { GenderIcon } from '@/shared/assets/icons'
import type { AdoptionDetailDto } from '@/shared/types'
import { BaseInfoCard } from './BaseInfoCard'
import { EmptyNote } from './EmptyNote'

interface ParentInfoCardProps {
  detail: AdoptionDetailDto
  onImageClick?: (images: string[], index?: number) => void
}

const ParentInfoCard = ({ detail, onImageClick }: ParentInfoCardProps) => {
  // [refactored] onClick마다 재계산하던 부모 이미지 배열을 한 번만 계산
  const parentImages = detail.parents.map((p) => p.imageUrl)

  return (
    <BaseInfoCard
      title="부모 정보"
      className="mt-[0.75rem] pc:col-start-2 pc:row-span-2 pc:row-start-1 pc:mt-0"
    >
      {detail.parents.length === 0 && <EmptyNote>등록된 부모 정보가 없어요.</EmptyNote>}

      {/* 세로 배치: 4:3 이미지 → 배지(role + 성별 아이콘) + 이름/생일 — Figma 1240-45069 */}
      <div className="flex flex-col gap-[0.75rem] pc:gap-5">
        {detail.parents.map((parent, i) => (
          <div key={parent.role} className="flex flex-col items-start gap-[0.75rem]">
            {/* 이미지: 4:3 풀폭 (rounded-8) */}
            <button
              type="button"
              onClick={() => onImageClick?.(parentImages, i)}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[0.5rem] bg-[#c6c6c6]"
            >
              {/* 사진 미등록이면 회색 배경만 — 빈 src를 <Image>에 넘기지 않는다 */}
              {parent.imageUrl && (
                <Image
                  src={parent.imageUrl}
                  alt={`${parent.role} 사진`}
                  fill
                  sizes="(max-width: 768px) 40vw, 200px"
                  className="object-cover"
                />
              )}
            </button>

            {/* 배지(role + 성별 아이콘) + 이름/생일 */}
            <div className="flex items-start gap-[0.5rem] text-[1rem] leading-[1.5] font-semibold text-neutral-850">
              <Badge variant="primaryOutline" size="lg" className="shrink-0">
                {parent.role}
                <GenderIcon
                  gender={parent.role === '엄마' ? 'female' : 'male'}
                  className="size-[1.5rem]"
                />
              </Badge>
              <div className="flex flex-col gap-[0.125rem]">
                <span>{parent.name}</span>
                <span>{parent.birthDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseInfoCard>
  )
}

export { ParentInfoCard }
