'use client'

import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { ContestEntry } from '@/shared/types'
import { ArrowRightIcon } from '@/shared/assets'
import { ProfileAvatar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ContestEntryImage, isContestImageSourceSupported } from '@/entities/contest'
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

/**
 * 왕관 (Figma 2940-284195, 왕관-asset). 등수별로 색만 다르고 형태는 동일한 하나의
 * 컴포넌트라, 금(type=금) 베리언츠에서 뽑은 정확한 픽셀 패스를 그대로 쓰고
 * 색상 4곳(shade/main/light/dark)만 crownPalette로 교체한다. 테두리(#AD651D)는
 * 등수와 무관하게 고정 — 실제 은/동 조각을 샘플링해 확인함.
 */
const CrownIcon = ({ rank }: { rank: 1 | 2 | 3 }) => {
  const color = crownPalette[rank]

  return (
    <svg viewBox="0 0 47.8388 38.2503" fill="none" aria-hidden="true" className="h-8 w-10">
      <path
        d="M3.74874 0.6H0.6V6.87501H3.74874V0.6ZM19.4901 0.6H16.3413V6.87501H19.4901V0.6ZM28.9327 0.6H25.784V6.87501H28.9327V0.6ZM44.685 0.6H41.5362V6.87501H44.685V0.6ZM6.89254 6.87527H3.74379V13.1502H6.89254V6.87527ZM16.3463 6.87527H13.1974V13.1502H16.3463V6.87527ZM32.0875 6.87527H28.9388V13.1502H32.0875V6.87527ZM41.5301 6.87527H38.3814V13.1502H41.5301V6.87527ZM13.1963 13.1498H6.8987V16.2873H13.1963V13.1498ZM38.3801 13.1498H32.0827V16.2873H38.3801V13.1498ZM10.0474 16.2873H6.8987V19.4248H10.0474V16.2873ZM38.3862 16.2873H35.2375V19.4248H38.3862V16.2873Z"
        fill="#ad651d"
        stroke="#ad651d"
        strokeWidth={1.2}
        strokeLinecap="square"
      />
      <path
        d="M19.4901 6.87527H16.3413V13.1502H19.4901V6.87527ZM6.89254 13.1498H3.74379V19.4249H6.89254V13.1498ZM19.484 13.1498H13.1864V16.2873H19.484V13.1498ZM19.4888 16.2873H10.0426V19.4248H19.4888V16.2873ZM19.4876 19.425H3.74379V28.8375H19.4876V19.425ZM19.4876 31.9746H3.74379V38.2497H19.4876V31.9746Z"
        fill={color.shade}
      />
      <path
        d="M25.7937 0.6H19.4961V13.15H25.7937V0.6ZM3.74874 6.87527H0.6V38.2503H3.74874V6.87527ZM28.9424 6.87527H19.4961V28.8373H28.9424V6.87527ZM28.9424 31.9746H19.4961V38.2497H28.9424V31.9746ZM47.8337 6.87527H41.5362V13.1502H47.8337V6.87527ZM47.8388 13.1498H38.3925V19.4249H47.8388V13.1498ZM47.8325 19.425H35.2375V38.25H47.8325V19.425Z"
        fill={color.main}
      />
      <path
        d="M32.0875 13.1498H28.9388V16.2873H32.0875V13.1498ZM35.2363 16.2873H28.9388V28.8374H35.2363V16.2873ZM35.2363 31.9746H28.9388V38.2497H35.2363V31.9746Z"
        fill={color.light}
      />
      <path d="M44.6825 28.8378H0.6V31.9753H44.6825V28.8378Z" fill={color.dark} />
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

// //QA: 발자국 패턴 재검증 (Figma 2950-318018, "Group 92") — mo엔 발자국이 아예 없고,
// //QA: tab·pc는 좌하단 근처에 같은 4개짜리 뭉치 하나(189.41×66.98px)만 놓인다(기존처럼
// //QA: 화면 전체에 8개씩 흩뿌리지 않음). 색도 secondary-400이 아니라 primary-200(#ddbe9f).
const PAW_CLUSTER = [
  { left: 0, top: 20.35 },
  { left: 64.12, top: 31.65 },
  { left: 154.08, top: 16.66 },
  { left: 103.27, top: 0 },
] as const

type PawPatternVariant = 'tab' | 'pc'

const PAW_CLUSTER_OFFSET = {
  tab: { left: -22.25, top: 196.443 },
  pc: { left: -15.412, top: 314.567 },
} as const

const PawPattern = ({ variant, className }: { variant: PawPatternVariant; className?: string }) => {
  const offset = PAW_CLUSTER_OFFSET[variant]

  return (
    <div
      className={cn('pointer-events-none absolute h-[66.98px] w-[189.412px]', className)}
      style={{ left: offset.left, top: offset.top }}
      aria-hidden="true"
    >
      {PAW_CLUSTER.map((position, index) => (
        <span
          key={index}
          className="absolute flex size-[35.333px] items-center justify-center text-primary-200"
          style={position}
        >
          <PawIcon className="h-[1.719rem] w-[2.0625rem] rotate-[43.2deg]" />
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
        <ContestEntryImage
          src={entry.photoUrl}
          alt={entry.description || `${entry.userDisplayName}의 명예의 전당 사진`}
          sizes="(min-width: 1440px) 211px, 122px"
          loading="eager"
          fetchPriority={rank === 1 ? 'high' : 'auto'}
          fallbackIconClassName="size-14 pc:size-20"
        />
      )}
    </>
  )

  const canOpen = Boolean(entry && onClick && isContestImageSourceSupported(entry.photoUrl))

  return (
    // //QA: 그림자 위치 수정 — Figma(2752-270622)의 drop-shadow는 카드 전체가 아니라
    // //QA: 프레임(사진) 자체에 걸려있다. 알약은 기본 상태엔 그림자가 없다(profile-hover 때만 생김).
    <div className="group/frame relative h-[7.0625rem] w-[8.25rem] shrink-0 drop-shadow-[0_7px_3.5px_rgba(55,55,55,0.1)] pc:h-[12.1875rem] pc:w-[14.3125rem]">
      {/* //QA: 왕관 위치 — Figma(2752-269969)의 top:-16px/aspect-40x32 그대로, 프레임 상단 중앙에 살짝 겹쳐 띄운다. */}
      <div className="absolute inset-x-[41.27%] top-[-1rem] z-20 flex justify-center">
        <CrownIcon rank={rank} />
      </div>

      {canOpen ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`${entry!.userDisplayName} 사진 자세히 보기`}
          className="absolute inset-[4.6%_4%_5.55%_4%] overflow-hidden rounded-lg bg-neutral-100"
        >
          {photo}
          {/* //QA: hover 안내 — Figma는 size=md(=pc)에만 status=hover(2752-270622)가 있고
              //QA: size=sm(mo/tab)엔 hover 베리언츠 자체가 없어, PC 전용으로만 딤+"자세히"를 낸다. */}
          <span className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/0 transition-colors pc:flex pc:group-hover/frame:bg-black/60">
            <span className="rounded-full border border-white px-2 py-1 text-sm font-semibold text-white opacity-0 transition-opacity pc:group-hover/frame:opacity-100">
              자세히
            </span>
          </span>
        </button>
      ) : (
        <div className="absolute inset-[4.6%_4%_5.55%_4%] overflow-hidden rounded-lg bg-neutral-100">
          {photo}
        </div>
      )}

      <svg
        viewBox="0 0 132 113"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full text-primary-500 pc:hidden"
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
        className="pointer-events-none absolute inset-0 hidden size-full text-primary-500 pc:block"
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
    // //QA: 카드 배경 제거 — Figma(2752-270620)는 카드 자체 배경/보더가 없다 (기존
    // //QA: bg-secondary-50 박스 제거). 그림자는 프레임/알약 각자가 갖는다(PixelFrame 참고).
    <article className="relative z-10 flex w-[9.25rem] shrink-0 flex-col items-center gap-2 pc:w-[16.3125rem]">
      <PixelFrame entry={entry} rank={rank} onClick={onClick} />

      {/* //QA: profile-hover(2752-270764) — 알약에 마우스를 올리면 bg가 point-100→white로,
          //QA: 그림자가 새로 생긴다. */}
      <div className="flex w-full items-center gap-[1.75rem] rounded-full bg-point-100 p-1 transition-[background-color,box-shadow] hover:bg-white hover:shadow-[0_7px_3.5px_rgba(55,55,55,0.1)] pc:gap-5 pc:p-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 pc:gap-2">
          {/* [refactored] CardAvatar 제거 — ProfileAvatar 폴백(paw)으로 통일 */}
          <ProfileAvatar
            size="responsivePc"
            src={entry?.userProfileImageUrl ?? undefined}
            alt={entry?.userDisplayName}
            className="shrink-0"
          />
          <span className="min-w-0 truncate text-xs leading-[1.5] font-semibold text-neutral-850 pc:text-base">
            {entry?.userDisplayName ?? '수상자 없음'}
          </span>
        </div>

        {entry && (
          <Link
            href={`/home/${entry.userId}`}
            className="hidden shrink-0 items-center px-1 text-sm leading-[1.5] font-semibold whitespace-nowrap text-neutral-850 pc:flex"
          >
            브리더홈
            <ArrowRightIcon className="size-5" />
          </Link>
        )}
      </div>
    </article>
  )
}

const HallOfFamePodium = ({ entries, onEntryClick, className }: HallOfFamePodiumProps) => {
  const ranked = ([1, 2, 3] as const).map((rank, index) => ({ rank, entry: entries[index] }))

  return (
    // //QA: 배경 재검증(Figma 2950-318018) — bg-secondary-200(테두리 없음) →
    // //QA: bg-point-100 + border-primary-500 (mo/tab/pc 공통).
    <div
      className={cn(
        'relative flex h-[13.8125rem] w-full shrink-0 items-center overflow-hidden rounded-xl border border-primary-500 bg-point-100 px-4 py-8 tab:h-[16.8rem] tab:items-start tab:justify-center tab:p-8 pc:h-[26.425rem] pc:min-w-0 pc:flex-1 pc:shrink',
        className,
      )}
    >
      {/* //QA: mo는 발자국 없음 (Figma에 해당 레이어 자체가 없음) */}
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
