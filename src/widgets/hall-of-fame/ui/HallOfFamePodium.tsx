'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { ContestEntry } from '@/shared/types'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { ProfileAvatar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import 'swiper/css'

interface HallOfFamePodiumProps {
  entries: (ContestEntry | undefined)[]
  onEntryClick?: (entry: ContestEntry) => void
  className?: string
}

const crownPalette = {
  1: { light: '#FCFFAE', main: '#FCE600', shade: '#FC9606', dark: '#D46E0A' },
  2: { light: '#F8FAFC', main: '#D5DAE0', shade: '#9CA5B1', dark: '#737C87' },
  3: { light: '#F2BC82', main: '#CD7F32', shade: '#A75E2B', dark: '#7C401F' },
} as const

const CrownIcon = ({ rank }: { rank: 1 | 2 | 3 }) => {
  const color = crownPalette[rank]

  return (
    <svg viewBox="0 0 48 39" fill="none" aria-hidden="true" className="h-8 w-10">
      <path
        d="M0 0h4v7h3v6h6V7h3V0h4v7h8V0h4v7h3v6h6V7h3V0h4v20h-3v16h-4v3H4v-3H0V20h3V7H0V0Z"
        fill="#406DFF"
      />
      <path d="M4 7h3v10h6v3H4V7Zm40 0h-3v10h-6v3h9V7Z" fill={color.shade} />
      <path d="M7 20h34v13H7V20ZM20 7h8v13h-8V7Z" fill={color.main} />
      <path d="M13 13h7v7h-7v-7Zm15 0h7v7h-7v-7Z" fill={color.light} />
      <path d="M7 29h34v4H7v-4Zm4 4h26v3H11v-3Z" fill={color.dark} />
    </svg>
  )
}

const PawIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24.522 20.461" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M7.107 0h2.88v1.455h1.432v4.367H9.987v1.472h-2.88V5.822H5.71V1.455h1.398V0Zm7.428 0h2.863v1.455h1.415v4.367h-1.415v1.472h-2.88V5.822h-1.432V1.455h1.449V0ZM1.364 5.856h2.88v1.438h1.449v4.4H4.244v1.473h-2.88v-1.473H0v-4.4h1.364V5.856Zm18.931 0h2.863v1.438h1.364v4.4h-1.364v1.473h-2.863v-1.473h-1.449v-4.4h1.449V5.856ZM10.004 8.766h4.497v1.456h1.466v1.472h1.431v1.473h1.415v1.472h1.448v4.35h-1.448v1.472h-4.295v-1.472h-4.514v1.472H5.71v-1.472H4.261v-4.35H5.71v-1.472h1.397v-1.473H8.54v-1.472h1.465V8.766Z"
    />
  </svg>
)

type PawPatternSize = 'pc' | 'tab' | 'mo'

const PAW_POSITIONS = {
  pc: [
    { top: 11.75, right: 323.97 },
    { top: 32, right: 236.92 },
    { top: -14.84, right: 169.86 },
    { top: 19.1, right: 78.49 },
    { top: 348.46, right: 1100.23 },
    { top: 368.71, right: 1013.18 },
    { top: 321.87, right: 946.12 },
    { top: 355.81, right: 854.75 },
  ],
  tab: [
    { top: 199.59, right: 715.65 },
    { top: 219.84, right: 628.6 },
    { top: 173, right: 561.54 },
    { top: 206.95, right: 470.17 },
    { top: 7.95, right: 248.97 },
    { top: 28.2, right: 161.92 },
    { top: -18.64, right: 94.86 },
    { top: 15.3, right: 3.49 },
  ],
  mo: [
    { top: 0.39, left: 164 },
    { top: 13.48, left: 220.27 },
    { top: -16.8, left: 263.62 },
    { top: 5.14, left: 322.68 },
  ],
} as const

const PawPattern = ({ variant, className }: { variant: PawPatternSize; className?: string }) => {
  const compact = variant === 'mo'

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      {PAW_POSITIONS[variant].map((position, index) => (
        <span
          key={index}
          className={cn(
            'absolute flex items-center justify-center text-secondary-400',
            compact ? 'size-[2.708rem]' : 'size-[4.189rem]',
          )}
          style={position}
        >
          <PawIcon
            className={cn(
              'rotate-[52.47deg]',
              compact ? 'h-[1.75rem] w-[2.0625rem]' : 'h-[2.6875rem] w-[3.1875rem]',
            )}
          />
        </span>
      ))}
    </div>
  )
}

const PixelFrame = ({
  entry,
  rank,
  onClick,
}: {
  entry?: ContestEntry
  rank: 1 | 2 | 3
  onClick?: () => void
}) => {
  const photo = (
    <>
      {entry && (
        <Image
          src={entry.photoUrl}
          alt={entry.description || `${entry.userDisplayName}의 명예의 전당 사진`}
          fill
          sizes="(min-width: 1440px) 211px, 122px"
          className="object-cover"
        />
      )}
    </>
  )

  return (
    <div className="relative h-[7.0625rem] w-[8.25rem] shrink-0 pc:h-[12.1875rem] pc:w-[14.3125rem]">
      <div className="absolute top-[-1rem] left-1/2 z-20 -translate-x-1/2">
        <CrownIcon rank={rank} />
      </div>

      {entry && onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`${entry.userDisplayName} 사진 자세히 보기`}
          className="absolute inset-[4.6%_4%_5.55%_4%] overflow-hidden rounded-lg bg-[#e1e8ff]"
        >
          {photo}
        </button>
      ) : (
        <div className="absolute inset-[4.6%_4%_5.55%_4%] overflow-hidden rounded-lg bg-[#e1e8ff]">
          {photo}
        </div>
      )}

      <svg
        viewBox="0 0 132 113"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full text-secondary-500 pc:hidden"
      >
        <path
          d="M116.16 5.302h10.561v5.3H132v18.554h-.002V113H10.56v-6.165H5.28v-6.559h10.561v6.56h100.318v-6.56h10.561V10.603h-10.561V5.302H15.84v5.3H5.281v-5.3H15.84V0h100.32v5.302Zm-110.88 94.974H0V10.602h5.28v89.674Z"
          fill="currentColor"
        />
      </svg>
      <svg
        viewBox="0 0 229 195"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden size-full text-secondary-500 pc:block"
      >
        <path
          d="M229 18.296v32.019h-.003V195H18.318v-10.639H9.163v-11.318h18.318v11.319h174.04v-11.319h18.32V18.296H229ZM9.16 173.043H0V18.296h9.16v154.747ZM201.52 9.148H27.48v9.148H9.163V9.148h18.318V0H201.52v9.148Zm18.321 0v9.148h-18.32V9.148h18.32Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

const PodiumCard = ({
  entry,
  rank,
  onClick,
}: {
  entry?: ContestEntry
  rank: 1 | 2 | 3
  onClick?: () => void
}) => {
  return (
    <article className="relative z-10 flex w-[9.25rem] shrink-0 flex-col items-center gap-2 rounded-xl bg-secondary-50 p-2 shadow-[0_7px_7px_rgba(55,55,55,0.1)] pc:w-[16.3125rem] pc:px-4 pc:py-2">
      <PixelFrame entry={entry} rank={rank} onClick={onClick} />

      <div className="flex w-full items-center p-0.5 pc:p-1">
        <div className="flex min-w-0 flex-1 items-center gap-1 pc:gap-2">
          {/* [refactored] CardAvatar 제거 — ProfileAvatar 폴백(paw)으로 통일 */}
          <ProfileAvatar
            size="responsivePc"
            src={entry?.userProfileImageUrl ?? undefined}
            alt={entry?.userDisplayName}
            className="shrink-0"
          />
          <span className="min-w-0 truncate text-xs leading-[1.5] font-semibold text-neutral-850 pc:text-base">
            {entry?.userDisplayName ?? 'profile'}
          </span>
        </div>

        <Link
          href={entry ? `/home/${entry.userId}` : '/home'}
          className="hidden shrink-0 items-center px-1 text-sm leading-[1.5] font-semibold whitespace-nowrap text-neutral-850 pc:flex"
        >
          브리더홈
          <ArrowRightIcon className="size-5" />
        </Link>
      </div>
    </article>
  )
}

const HallOfFamePodium = ({ entries, onEntryClick, className }: HallOfFamePodiumProps) => {
  const ranked = ([1, 2, 3] as const).map((rank, index) => ({ rank, entry: entries[index] }))

  return (
    <div
      className={cn(
        'relative flex h-[13.8125rem] w-full shrink-0 items-center overflow-hidden rounded-xl bg-secondary-200 px-4 py-8 tab:h-[16.8rem] tab:items-start tab:justify-center tab:p-8 pc:h-[26.425rem] pc:w-[66.0625rem]',
        className,
      )}
    >
      <PawPattern variant="mo" className="tab:hidden" />
      <PawPattern variant="tab" className="hidden tab:block pc:hidden" />
      <PawPattern variant="pc" className="hidden pc:block" />

      <Swiper
        slidesPerView="auto"
        spaceBetween={10}
        slidesOffsetAfter={16}
        watchOverflow
        className="relative z-10 !m-0 !h-[11.8125rem] !w-[calc(100%+1rem)] !shrink-0 tab:!hidden"
      >
        {ranked.map(({ rank, entry }) => (
          <SwiperSlide key={entry?.id ?? rank} className="!flex !h-full !w-[9.25rem] !items-center">
            <PodiumCard
              entry={entry}
              rank={rank}
              onClick={entry && onEntryClick ? () => onEntryClick(entry) : undefined}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="relative z-10 hidden h-full shrink-0 items-start gap-5 tab:flex pc:gap-[1.9375rem]">
        {ranked.map(({ rank, entry }) => (
          <div
            key={entry?.id ?? rank}
            className={cn(
              'shrink-0',
              rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3',
              rank !== 1 && 'flex h-full items-end',
            )}
          >
            <PodiumCard
              entry={entry}
              rank={rank}
              onClick={entry && onEntryClick ? () => onEntryClick(entry) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { HallOfFamePodium }
