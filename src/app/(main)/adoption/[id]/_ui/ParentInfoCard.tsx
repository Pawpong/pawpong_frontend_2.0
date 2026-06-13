import Image from 'next/image'
import { Badge } from '@/shared/ui'
import { GenderIcon } from '@/shared/assets/icons'
import type { AdoptionDetailDto } from '@/shared/types'
import { BaseInfoCard } from './BaseInfoCard'

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
      {/* 세로 배치: 4:3 이미지 → 배지(role + 성별 아이콘) + 이름/생일 — Figma 1240-45069 */}
      <div className="flex flex-col gap-[0.75rem]">
        {detail.parents.map((parent, i) => (
          <div key={parent.role} className="flex flex-col items-start gap-[0.75rem]">
            {/* 이미지: 4:3 풀폭 (rounded-8) */}
            <button
              type="button"
              onClick={() => onImageClick?.(parentImages, i)}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[0.5rem] bg-[#c6c6c6]"
            >
              <Image
                src={parent.imageUrl}
                alt={`${parent.role} 사진`}
                fill
                className="object-cover"
              />
            </button>

            {/* 배지(role + 성별 아이콘) + 이름/생일 */}
            <div className="flex items-start gap-[0.5rem] text-[1rem] leading-[1.5] font-semibold text-[#3e3e3e]">
              <Badge variant="active" size="md" className="shrink-0">
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
