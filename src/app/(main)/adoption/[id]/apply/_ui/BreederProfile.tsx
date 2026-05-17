import Image from 'next/image'
import { Badge } from '@/shared/ui'
import type { AdoptionDetailDto } from '@/shared/types'

interface BreederProfileProps {
  breeder: AdoptionDetailDto['breeder']
}

const BreederProfile = ({ breeder }: BreederProfileProps) => (
  <div className="hidden tab:block tab:px-[6.25rem]">
    <div className="flex items-center gap-[0.75rem] border-b border-transparent py-[0.625rem]">
      <div className="relative size-[2.75rem] shrink-0 overflow-hidden rounded-full bg-[#d4d4d4]">
        <Image
          src={breeder.profileImageUrl}
          alt={breeder.nickname}
          fill
          className="object-cover"
        />
      </div>
      <p className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
        {breeder.nickname}
      </p>
      <Badge
        variant="outline"
        className="px-[0.625rem] py-[0.25rem] text-[0.875rem] leading-[1.375rem]"
      >
        {breeder.bpm} BPM
      </Badge>
    </div>
  </div>
)

export { BreederProfile }
