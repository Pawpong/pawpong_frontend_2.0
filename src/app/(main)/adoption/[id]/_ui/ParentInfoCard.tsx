import Image from 'next/image'
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
      className="mt-[0.75rem] tab:mt-0 tab:w-[26.25rem] tab:shrink-0 pc:w-auto pc:flex-1"
    >
      <div className="flex flex-col gap-[1rem] tab:gap-[1.25rem]">
        {detail.parents.map((parent, i) => (
          <div key={parent.role} className="flex flex-col gap-[0.8125rem]">
            <div className="flex items-center gap-[0.5625rem] tab:flex-col tab:items-start tab:gap-[0.8125rem]">
              <button
                type="button"
                onClick={() => onImageClick?.(parentImages, i)}
                className="relative size-[6.25rem] shrink-0 overflow-hidden rounded-[0.5rem] bg-[#c6c6c6] tab:aspect-[368/204] tab:h-auto tab:w-full tab:rounded-[0.6875rem]"
              >
                <Image
                  src={parent.imageUrl}
                  alt={`${parent.role} 사진`}
                  fill
                  className="object-cover"
                />
              </button>
              <div className="flex gap-[0.4375rem] text-[0.875rem] leading-[1.5] font-semibold text-[#5d5d5d] tab:gap-[1.375rem]">
                <span className="font-bold">{parent.role}</span>
                <div className="flex flex-col gap-[0.25rem]">
                  <span>{parent.name}</span>
                  <span>{parent.birthDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseInfoCard>
  )
}

export { ParentInfoCard }
