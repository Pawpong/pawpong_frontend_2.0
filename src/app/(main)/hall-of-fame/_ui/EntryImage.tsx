import Image from 'next/image'
import { ArrowRightIcon } from '@/shared/assets'
import type { ContestEntry } from '@/shared/types'

interface EntryImageProps {
  entry: ContestEntry
  className?: string
}

/** 이미지 + 참여자 정보 */
const EntryImage = ({ entry, className }: EntryImageProps) => (
  <div className={`relative flex flex-col items-center justify-center ${className ?? ''}`}>
    <div className="w-[20.9375rem] overflow-hidden rounded-[1.1rem] bg-[#c6c6c6] tab:w-full tab:max-w-[27.875rem]">
      <Image
        src={entry.photoUrl}
        alt={entry.description}
        width={446}
        height={450}
        className="aspect-square size-full object-cover"
      />
    </div>
    <div className="absolute right-5 bottom-4 flex flex-col items-end tab:right-6">
      <span className="text-base font-semibold text-white tab:text-xl">
        {entry.userDisplayName}
      </span>
      <button
        type="button"
        className="flex items-center text-base font-semibold text-white tab:text-xl"
      >
        홈으로
        <ArrowRightIcon className="size-6 text-white" />
      </button>
    </div>
  </div>
)

export { EntryImage }
