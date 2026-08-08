'use client'

import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import {
  AffectionBadge,
  Container,
  PopularBadge,
  ProfileAvatar,
  ListingStats,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'
import { ArrowRightIcon, CheckIcon, GenderIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { GENDER_LABEL } from '@/shared/types'
import type { AdoptionDetailDto, AdoptionStatus } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from '@/entities/adoption'
import { HeroImageCarousel } from './HeroImageCarousel'
import { FavoriteShareActions } from './FavoriteShareActions'

interface AdoptionDetailHeroProps {
  detail: AdoptionDetailDto
  onImageClick: (images: string[], index?: number) => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

// [refactored] JSX 안에 있던 브레드크럼 라벨을 모듈 상수로 분리
const BREADCRUMB = ['홈', '입양', '도마뱀']

// [refactored] InfoItem과 소개글이 각자 들고 있던 동일한 타이포 클래스를 상수로 통일
// 피그마: 라벨 body/lg/medium 16px neutral-700 (pc 20px), 값 body/lg/bold 16px neutral-850
const INFO_LABEL_CLASS = 'text-[1rem] leading-[1.5] font-medium text-neutral-700 pc:text-[1.25rem]'
const INFO_VALUE_CLASS =
  'text-[1rem] leading-[1.5] font-semibold text-neutral-850 pc:text-[1.25rem]'

/* ── 입양 상세 히어로 (브레드크럼 + 이미지 + 브리더 프로필 | 정보) ── */
const AdoptionDetailHero = ({
  detail,
  onImageClick,
  isFavorite,
  onToggleFavorite,
}: AdoptionDetailHeroProps) => {
  // [refactored] 모바일·pc 두 블록이 똑같이 넘기던 props를 한 곳에서 만든다
  const statsProps = {
    inquiryCount: detail.inquiryCount,
    favoriteCount: detail.favoriteCount,
    viewCount: detail.viewCount,
  }
  const shareProps = {
    shareTitle: detail.name,
    shareDescription: detail.description,
    shareImageUrl: detail.imageUrls[0],
  }

  return (
    // 좌우 패딩(모바일16/탭48/pc80)은 Container가 담당, 이미지만 음수마진으로 풀블리드. pc 섹션 py-20
    <Container className="px-[1rem] pc:py-[1.25rem]">
      <div className="pc:flex pc:items-start pc:gap-[1.25rem]">
        {/* ── 좌측 섹션: 브레드크럼 + 이미지 + 브리더 프로필 ── 피그마: w-500, gap-12 */}
        <div className="relative -mx-[1rem] tab:-mx-[3rem] pc:mx-0 pc:flex pc:w-[31.25rem] pc:shrink-0 pc:flex-col pc:gap-[0.75rem]">
          {/* 브레드크럼 (데스크탑 전용) — 피그마: 라벨(body/md/bold 14px #6b6b6b) + chevron */}
          <div className="hidden items-end py-[0.625rem] pc:flex">
            {BREADCRUMB.map((label, index) => (
              <Fragment key={label}>
                {index > 0 && <ArrowRightIcon className="size-[1.5rem] text-neutral-700" />}
                <span className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-neutral-700">
                  {label}
                </span>
              </Fragment>
            ))}
          </div>

          {/* 이미지 영역 (클릭 시 모달, 좌우 슬라이드 네비게이션) */}
          <HeroImageCarousel
            images={detail.imageUrls}
            alt={detail.name}
            onImageClick={(index) => onImageClick(detail.imageUrls, index)}
          />

          {/* 브리더 프로필 (데스크탑 전용) */}
          <BreederProfileRow breeder={detail.breeder} className="hidden pc:flex" />
        </div>

        {/* ── 우측 섹션: 이름 ~ 관심/공유 ── 좌우 px는 바깥 Container가, 여기는 py만 (px 없음) */}
        {/* pc: self-stretch가 동작하려면 height가 auto여야 함(h-full 제거) → justify-between + py-48로 하단 그룹을 이미지 바닥에 정렬 */}
        <div className="flex w-full flex-col py-[0.75rem] pc:flex-1 pc:items-end pc:justify-between pc:self-stretch pc:py-[3rem]">
          {/* 브리더 프로필 (모바일·탭만 여기서 표시 — pc는 좌측 이미지 컬럼 아래) */}
          <BreederProfileRow breeder={detail.breeder} className="mb-[0.75rem] flex pc:hidden" />

          {/* ── 상단 그룹: 이름 ~ 소개글 ── 피그마 Component10 gap-12 (pc는 20) */}
          <div className="flex w-full flex-col gap-[0.75rem] pc:gap-[1.25rem]">
            {/* 이름 + 상태 배지(드롭다운) + 인기 배지 (피그마: 모바일 body/xl/bold 20px, pc 24px) */}
            <div className="flex flex-wrap items-center gap-[0.5rem]">
              <p className="text-[1.25rem] leading-[1.5] font-semibold text-neutral-850 pc:text-[1.5rem]">
                {detail.name}
              </p>
              <StatusDropdown currentStatus={detail.status} />
              {detail.isPopular && (
                <PopularBadge
                  variant="outline"
                  className="h-[1.375rem] bg-white px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
                />
              )}
            </div>

            {/* 분양가 / 태어난 날 / 성별 / 소개글 — 피그마 정보 블록 gap-8 */}
            <div className="flex w-full flex-col pc:gap-5 gap-2">
              <InfoItem label="분양가" value={detail.price} />
              <InfoItem label="태어난 날" value={detail.birthDate} />
              <InfoItem
                label="성별"
                value={GENDER_LABEL[detail.gender]}
                trailing={
                  <GenderIcon gender={detail.gender} className="size-[2rem] text-neutral-700" />
                }
              />

              {/* 소개글 (라벨 ↔ 내용 gap-4px, 내용 body/lg/bold 16px) */}
              <div className="flex flex-col gap-[0.25rem]">
                {/* [refactored] 중복 타이포 클래스 → INFO_LABEL_CLASS / INFO_VALUE_CLASS */}
                <p className={INFO_LABEL_CLASS}>소개글</p>
                <p className={cn(INFO_VALUE_CLASS, 'whitespace-pre-wrap')}>{detail.description}</p>
              </div>
            </div>
          </div>

          {/* 문의/관심/조회 + 공유 (모바일·탭) — 피그마 1943:128143: 좌측 통계(flex-1) + 우측 공유 */}
          <div className="mt-[0.75rem] flex w-full items-end justify-between gap-[0.75rem] pc:hidden">
            {/* 피그마 CardInfo: body/sm/medium 12px neutral-700 (공용 base 색 #8e8e8e는 호출부에서만 덮음) */}
            {/* [refactored] 반복되던 카운트·공유 props → statsProps / shareProps */}
            <ListingStats {...statsProps} size="md" className="text-neutral-700" />
            <FavoriteShareActions
              {...shareProps}
              className="gap-[0.5rem]"
              labelClassName="hidden text-neutral-700 tab:inline"
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
            />
          </div>

          {/* ── 하단 그룹: 문의/관심/조회 + 관심/공유 (데스크탑 전용) ── */}
          <div className="hidden flex-col items-end gap-[0.5rem] pc:flex">
            <ListingStats {...statsProps} size="lg" />
            <FavoriteShareActions
              {...shareProps}
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
            />
          </div>
        </div>
      </div>
    </Container>
  )
}

/* [refactored] 모바일·pc에 22줄씩 중복돼 있던 브리더 프로필 행을 하나로 추출 ──
   아바타 + 닉네임 + 애정도 ··· 브리더홈 >
   pc는 좌측 이미지 컬럼 아래, 모바일·탭은 우측 정보 컬럼 상단이라 DOM 위치가 달라 두 번 렌더한다.
   두 곳의 차이(아바타 32/40, 닉네임 14/16, 뱃지 md/lg, gap)는 전부 반응형 클래스로 흡수 — 보이는 쪽 클래스만 적용된다.
   피그마 모바일·탭 1867:182868 */
const BreederProfileRow = ({
  breeder,
  className,
}: {
  breeder: AdoptionDetailDto['breeder']
  className?: string
}) => (
  <div className={cn('w-full items-center gap-0 pc:gap-[1.75rem]', className)}>
    <div className="flex min-w-px flex-1 items-center gap-[0.5rem] pc:gap-[1.25rem]">
      <div className="flex items-center gap-[0.5rem]">
        {/* [refactored] 로컬 아바타 → 공통 ProfileAvatar (빈 src 폴백 내장) */}
        <ProfileAvatar
          src={breeder.profileImageUrl}
          alt={breeder.nickname}
          size="responsivePc"
          className="shrink-0"
        />
        <p className="text-[0.875rem] leading-[1.5] font-semibold text-neutral-850 pc:text-[1rem]">
          {breeder.nickname}
        </p>
      </div>
      {/* 뱃지는 size prop이 반응형이 아니라 md 기준 + pc에서 lg 치수로 덮는다 */}
      <AffectionBadge size="md" className="pc:h-[1.8125rem] pc:py-1 pc:text-sm" />
    </div>
    <Link
      href={`/home/${breeder.id}`}
      className="flex shrink-0 items-center gap-0 px-[0.25rem] text-[0.875rem] leading-[1.5] font-semibold text-neutral-850 pc:gap-[0.125rem]"
    >
      브리더홈
      <ArrowRightIcon className="size-[1.25rem]" />
    </Link>
  </div>
)

/* ── 정보 항목 (라벨 ↔ 내용: 가로 배치 gap-12px) ── */
/* 피그마: 라벨 body/lg/medium 16px neutral-700, 내용 body/lg/bold 16px neutral-850 (leading 1.5) — pc는 라벨만 20px */
const InfoItem = ({
  label,
  value,
  trailing,
}: {
  label: string
  value: string
  trailing?: ReactNode
}) => (
  <div className="flex items-center gap-[0.75rem]">
    {/* [refactored] 중복 타이포 클래스 → INFO_LABEL_CLASS / INFO_VALUE_CLASS */}
    <p className={cn('shrink-0', INFO_LABEL_CLASS)}>{label}</p>
    <div className="flex items-center gap-[0.25rem]">
      <p className={INFO_VALUE_CLASS}>{value}</p>
      {trailing}
    </div>
  </div>
)

/* ── 상태 변경 드롭다운 (브리더용) ── */
const STATUS_OPTIONS: AdoptionStatus[] = ['reserved', 'available', 'completed']

const StatusDropdown = ({ currentStatus }: { currentStatus: AdoptionStatus }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="inline-flex items-center rounded-full border border-primary-500 bg-white px-[0.625rem] py-[0.25rem] text-[0.75rem] leading-[1.375rem] font-semibold text-primary-500 pc:text-[0.875rem]"
      >
        {ADOPTION_CARD_STATUS[currentStatus].label}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      className="w-[7rem] rounded-[1rem] border-none bg-[#5d5d5d] px-[0.625rem] py-[0.5rem] shadow-[3px_3px_11px_0px_rgba(0,0,0,0.15)]"
    >
      {STATUS_OPTIONS.map((status) => (
        <DropdownMenuItem
          key={status}
          className="flex items-center justify-between rounded-none px-0 py-0 text-[0.875rem] leading-[1.375rem] font-medium text-white hover:bg-transparent focus:bg-transparent"
        >
          <span>{ADOPTION_CARD_STATUS[status].label}</span>
          {status === currentStatus && <CheckIcon className="size-[1.25rem]" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

export { AdoptionDetailHero }
