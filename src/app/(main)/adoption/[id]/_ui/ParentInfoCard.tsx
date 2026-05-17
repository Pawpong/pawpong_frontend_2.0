import Image from 'next/image'
import type { AdoptionDetailDto } from '@/shared/types'

interface ParentInfoCardProps {
  detail: AdoptionDetailDto
  onImageClick?: (images: string[], index?: number) => void
}

const ParentInfoCard = ({ detail, onImageClick }: ParentInfoCardProps) => (
  <div className="mt-[0.75rem] overflow-hidden rounded-[1rem] bg-[#f5f5f5] p-[0.875rem] tab:mt-0 tab:w-[26.25rem] tab:shrink-0 tab:p-[1.75rem]">
    <p className="text-[0.75rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1.25rem] tab:font-semibold">
      부모 정보
    </p>

    <div className="mt-[1rem] flex flex-col gap-[1rem] tab:mt-[1.5rem] tab:gap-[2.5rem]">
      {detail.parents.map((parent, i) => (
        <div key={parent.role} className="flex flex-col gap-[0.8125rem]">
          <div className="flex items-center gap-[0.5625rem] tab:flex-col tab:items-start tab:gap-[0.8125rem]">
            <button
              type="button"
              onClick={() => onImageClick?.(detail.parents.map((p) => p.imageUrl), i)}
              className="relative size-[6.25rem] shrink-0 overflow-hidden rounded-[0.5rem] bg-[#c6c6c6] tab:aspect-[368/204] tab:h-auto tab:w-full tab:rounded-[0.6875rem]"
            >
              <Image
                src={parent.imageUrl}
                alt={`${parent.role} 사진`}
                fill
                className="object-cover"
              />
            </button>
            <div className="flex gap-[0.4375rem] text-[0.875rem] font-semibold leading-[1.5] text-[#5d5d5d] tab:gap-[1.375rem]">
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
  </div>
)

export { ParentInfoCard }
