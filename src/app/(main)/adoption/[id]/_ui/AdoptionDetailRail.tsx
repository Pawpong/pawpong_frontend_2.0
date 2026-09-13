'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useAuthStatus } from '@/features/auth'
import { ReportBreederAction } from '@/features/report'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  ListingStats,
  PopularBadge,
  ProfileAvatar,
} from '@/shared/ui'
import { ArrowRightIcon, CheckIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { CATEGORY_LABEL } from '@/shared/types'
import type { AdoptionDetailDto, PetStatus } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from '@/entities/adoption'
import { DETAIL_TYPE } from '../_lib/detailTypography'
import { HeroImageCarousel } from './HeroImageCarousel'
import { FavoriteShareActions } from './FavoriteShareActions'

interface AdoptionDetailRailProps {
  detail: AdoptionDetailDto
  onImageClick: (images: string[], index?: number) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  showFavoriteAction: boolean
  /** 1024+ 전용 신청 CTA — 그 아래에서는 하단 고정 바가 맡는다 */
  cta?: ReactNode
}

/* ── 상태 변경 드롭다운 (브리더용) ── */
const STATUS_OPTIONS: PetStatus[] = ['reserved', 'available', 'adopted']

const StatusDropdown = ({ currentStatus }: { currentStatus: PetStatus }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="inline-flex shrink-0 items-center rounded-full border border-primary-500 bg-white px-[0.625rem] py-[0.25rem] text-[0.75rem] leading-[1.375rem] font-semibold text-primary-500 pc:text-[0.875rem]"
      >
        {ADOPTION_CARD_STATUS[currentStatus].label}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      className="w-[7rem] rounded-2xl border-none bg-neutral-800 px-[0.625rem] py-2 shadow-[3px_3px_11px_0px_rgba(0,0,0,0.15)]"
    >
      {STATUS_OPTIONS.map((status) => (
        <DropdownMenuItem
          key={status}
          className="flex items-center justify-between rounded-none px-0 py-0 text-sm leading-[1.375rem] font-medium text-white hover:bg-transparent focus:bg-transparent"
        >
          <span>{ADOPTION_CARD_STATUS[status].label}</span>
          {status === currentStatus && <CheckIcon className="size-5" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

/* ── 브리더 행 ── 아바타 + 닉네임 ··· 브리더홈 > + 신고 */
const BreederRow = ({ breeder }: { breeder: AdoptionDetailDto['breeder'] }) => {
  // 탈퇴한 브리더는 API가 닉네임을 빈 문자열로 내려준다(별도 플래그 없음). 이 신호로
  // 브리더홈 링크를 끊는다 — 링크를 그대로 두면 Link 프리페치가 /profile/breeders/{id},
  // /profile/users/{id} 를 곧장 호출해 400을 반복하고, 눌러도 갈 곳 없는 화면으로 보낸다.
  const isWithdrawn = !breeder.nickname.trim()
  const { isReady, isLoggedIn, userRole } = useAuthStatus()
  // 브리더 신고는 입양자(비로그인 포함)에게만 보인다
  const canReportBreeder = isReady && (!isLoggedIn || userRole === 'adopter')

  return (
    <div className="flex w-full items-center gap-2">
      <ProfileAvatar
        src={breeder.profileImageUrl}
        alt={breeder.nickname}
        size="responsivePc"
        className="shrink-0"
      />
      <p className={cn(DETAIL_TYPE.body, 'min-w-0 flex-1 truncate')}>
        {isWithdrawn ? '탈퇴한 브리더' : breeder.nickname}
      </p>
      {!isWithdrawn && (
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/home/${breeder.id}`}
            className={cn(DETAIL_TYPE.sub, 'flex items-center text-neutral-850')}
          >
            브리더홈
            <ArrowRightIcon className="size-5" />
          </Link>
          {canReportBreeder && <ReportBreederAction breederId={breeder.id} />}
        </div>
      )}
    </div>
  )
}

/**
 * 결정 레일 — 이미지·이름·상태·분양가·통계·관심/공유·브리더.
 * 1024+ 에서는 sticky 로 좌측에 남아, 우측 근거를 읽는 내내 결정 정보가 시야에 있다.
 * (그 아래 해상도에서는 그냥 맨 위 블록으로 쌓이고 신청 CTA 는 하단 고정 바가 맡는다)
 */
const AdoptionDetailRail = ({
  detail,
  onImageClick,
  isFavorite,
  onToggleFavorite,
  showFavoriteAction,
  cta,
}: AdoptionDetailRailProps) => (
  <aside className="-mx-4 flex flex-col gap-4 tab:mx-0 lap:sticky lap:top-24 lap:w-[20rem] lap:shrink-0 pc:w-[24rem]">
    <HeroImageCarousel
      images={detail.imageUrls}
      alt={detail.name}
      onImageClick={(index) => onImageClick(detail.imageUrls, index)}
    />

    <div className="flex flex-col gap-3 px-4 tab:px-0">
      <p className={DETAIL_TYPE.meta}>
        {['홈', '입양', CATEGORY_LABEL[detail.category]].join(' · ')}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className={DETAIL_TYPE.display}>{detail.name}</h1>
        <StatusDropdown currentStatus={detail.status} />
        {detail.isPopular && (
          <PopularBadge
            variant="outline"
            className="h-[1.375rem] bg-white px-2 py-[0.125rem] text-[0.75rem] leading-normal"
          />
        )}
      </div>

      {/* 결정 정보는 분양가 하나 — 생일·성별·품종은 '이 아이에 대해' 로 내렸다 */}
      <div className="flex items-baseline gap-2">
        <span className={DETAIL_TYPE.sub}>분양가</span>
        <span className="font-cafe24 text-xl leading-[1.4] text-primary-500 tab:text-2xl">
          {detail.price}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <ListingStats
          inquiryCount={detail.inquiryCount}
          favoriteCount={detail.favoriteCount}
          viewCount={detail.viewCount}
          size="md"
          className="text-neutral-700"
        />
        <FavoriteShareActions
          shareTitle={detail.name}
          shareDescription={detail.description}
          shareImageUrl={detail.imageUrls[0]}
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
          showFavorite={showFavoriteAction}
          className="gap-2"
          labelClassName="hidden text-neutral-700 tab:inline"
        />
      </div>

      {cta && <div className="hidden lap:flex">{cta}</div>}

      <hr className="border-neutral-200" />
      <BreederRow breeder={detail.breeder} />
    </div>
  </aside>
)

export { AdoptionDetailRail }
