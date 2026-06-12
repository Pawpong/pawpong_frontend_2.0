'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import {
  Badge,
  Container,
  ListingStats,
  Separator,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ArrowRightIcon, CheckIcon, GenderIcon } from '@/shared/assets/icons'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
import type { AdoptionDetailDto, AdoptionStatus } from '@/shared/types'
import { HeroImageCarousel } from './HeroImageCarousel'
import { FavoriteShareActions } from './FavoriteShareActions'

interface AdoptionDetailHeroProps {
  detail: AdoptionDetailDto
  onImageClick: (images: string[], index?: number) => void
}

/* ── 입양 상세 히어로 (브레드크럼 + 이미지 + 브리더 프로필 | 정보) ── */
const AdoptionDetailHero = ({ detail, onImageClick }: AdoptionDetailHeroProps) => (
  // 좌우 패딩(모바일20/탭48)은 Container가 담당, 이미지만 음수마진으로 풀블리드
  <Container className="pc:px-[3rem] pc:py-[0.75rem]">
    <div className="pc:flex pc:items-start pc:gap-[1.25rem]">
      {/* ── 좌측 섹션: 브레드크럼 + 이미지 + 브리더 프로필 ── 피그마: w-500, gap-12 */}
      <div className="relative -mx-[1.25rem] tab:-mx-[3rem] pc:mx-0 pc:flex pc:w-[31.25rem] pc:shrink-0 pc:flex-col pc:gap-[0.75rem]">
        {/* 브레드크럼 (데스크탑 전용) — 피그마: 라벨(body/md/bold 14px #6b6b6b) + chevron */}
        <div className="hidden items-end py-[0.625rem] pc:flex">
          {['홈', '입양', '도마뱀'].map((label, index) => (
            <Fragment key={label}>
              {index > 0 && <ArrowRightIcon className="size-[1.5rem] text-[#6b6b6b]" />}
              <span className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-[#6b6b6b]">
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

        {/* ── 브리더 프로필 (데스크탑 전용) ── 아바타 + 닉네임 + 애정도 배지 ··· 브리더홈 > */}
        <div className="hidden items-center gap-[1.75rem] pc:flex">
          <div className="flex flex-1 items-center gap-[1.25rem]">
            <div className="flex items-center gap-[0.5rem]">
              {/* [refactored] BreederAvatar 사용 */}
              <BreederAvatar
                src={detail.breeder.profileImageUrl}
                alt={detail.breeder.nickname}
                className="size-[2.5rem]"
              />
              <p className="text-[1rem] leading-[1.5] font-semibold text-[#3e3e3e]">
                {detail.breeder.nickname}
              </p>
            </div>
            <Badge variant="active">애정도</Badge>
          </div>
          <Link
            href={`/home/${detail.breeder.id}`}
            className="flex items-center gap-[0.125rem] px-[0.25rem] text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e]"
          >
            브리더홈
            <ArrowRightIcon className="size-[1.25rem]" />
          </Link>
        </div>
      </div>

      {/* ── 우측 섹션: 이름 ~ 관심/공유 ── 좌우 px는 바깥 Container가, 여기는 py만 (px 없음) */}
      <div className="flex h-full w-full flex-col py-[0.75rem] pc:flex-1 pc:items-end pc:justify-between pc:self-stretch pc:py-[3rem]">
        {/* 브리더 프로필 (모바일만 여기서 표시) */}
        <div className="w-full pc:hidden">
          <div className="flex items-center gap-[0.375rem]">
            {/* [refactored] BreederAvatar 사용 */}
            <BreederAvatar
              src={detail.breeder.profileImageUrl}
              alt={detail.breeder.nickname}
              className="size-[2.75rem]"
            />
            <div className="flex flex-1 flex-col">
              <p className="text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d]">
                {detail.breeder.nickname}
              </p>
              <p className="text-[0.75rem] leading-[1.5] font-semibold text-[#5d5d5d]">
                {detail.breeder.location}
              </p>
            </div>
            <Badge
              variant="outline"
              className="h-[1.5rem] px-[0.625rem] py-[0.25rem] text-[0.75rem] leading-[1.375rem]"
            >
              {detail.breeder.bpm} BPM
            </Badge>
          </div>
          <Separator className="my-[0.625rem] bg-[#d4d4d4]" />
        </div>

        {/* ── 상단 그룹: 이름 ~ 소개 (한 줄씩 gap-20px) ── */}
        <div className="flex w-full flex-col gap-[1.25rem]">
          {/* 이름 + 상태 배지(드롭다운) + 인기 배지 (피그마: body/2xl/bolder 24px) */}
          <div className="flex flex-wrap items-center gap-[0.4375rem] pc:gap-[0.5rem]">
            <p className="text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] pc:text-[1.5rem] pc:text-[#3e3e3e]">
              {detail.name}
            </p>
            <StatusDropdown currentStatus={detail.status} />
            {detail.isPopular && (
              <Badge
                variant="outline"
                className="h-[1.375rem] bg-white px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
              >
                인기🔥
              </Badge>
            )}
          </div>

          {/* 분양가 / 태어난 날 / 성별 — 동일한 라벨 ↔ 내용 구조 (gap-12px) */}
          <InfoItem label="분양가" value={detail.price} />
          <InfoItem label="태어난 날" value={detail.birthDate} />
          <InfoItem
            label="성별"
            value={GENDER_LABEL[detail.gender]}
            trailing={
              <GenderIcon gender={detail.gender} className="size-[1.5rem] text-[#6b6b6b]" />
            }
          />

          {/* 소개 (라벨 ↔ 내용 gap-4px, 내용 body/lg/bold 16px) */}
          <div className="flex flex-col gap-[0.25rem] text-[#5d5d5d]">
            <p className="text-[0.75rem] leading-[1.5] font-medium pc:text-[1.25rem] pc:text-[#6b6b6b]">
              소개
            </p>
            <p className="text-[0.875rem] leading-[1.5] font-semibold whitespace-pre-wrap pc:text-[1rem] pc:text-[#3e3e3e]">
              {detail.description}
            </p>
          </div>
        </div>

        {/* 문의/관심/조회 (모바일) */}
        <ListingStats
          inquiryCount={detail.inquiryCount}
          favoriteCount={detail.favoriteCount}
          viewCount={detail.viewCount}
          size="sm"
          className="mt-[0.5rem] justify-end pc:hidden"
        />

        {/* ── 하단 그룹: 문의/관심/조회 + 관심/공유 (데스크탑 전용) ── */}
        <div className="hidden flex-col items-end gap-[0.5rem] pc:flex">
          <ListingStats
            inquiryCount={detail.inquiryCount}
            favoriteCount={detail.favoriteCount}
            viewCount={detail.viewCount}
            size="lg"
          />
          <FavoriteShareActions />
        </div>
      </div>
    </div>
  </Container>
)

// [refactored] 브리더 아바타 (원형 이미지 + fallback 배경) — 데스크탑/모바일 중복 제거 (크기만 className)
const BreederAvatar = ({ src, alt, className }: { src: string; alt: string; className: string }) => (
  <div className={cn('relative shrink-0 overflow-hidden rounded-full bg-[#d4d4d4]', className)}>
    <Image src={src} alt={alt} fill className="object-cover" />
  </div>
)

/* ── 정보 항목 (라벨 ↔ 내용: 가로 배치 gap-12px) ── */
/* 피그마: 라벨 body/xl/medium #6b6b6b, 내용 body/xl/bold #3e3e3e (leading 1.5) */
const InfoItem = ({
  label,
  value,
  trailing,
}: {
  label: string
  value: string
  trailing?: ReactNode
}) => (
  <div className="flex items-center gap-[0.75rem] text-[#5d5d5d]">
    <p className="shrink-0 text-[0.75rem] leading-[1.5] font-medium pc:text-[1.25rem] pc:text-[#6b6b6b]">
      {label}
    </p>
    <div className="flex items-center gap-[0.25rem]">
      <p className="text-[0.875rem] leading-[1.5] font-semibold pc:text-[1.25rem] pc:text-[#3e3e3e]">
        {value}
      </p>
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
        className="inline-flex items-center gap-[0.625rem] rounded-full bg-[#5d5d5d] px-[0.625rem] py-[0.25rem] text-[0.75rem] leading-[1.375rem] font-semibold text-white pc:text-[0.875rem]"
      >
        {ADOPTION_STATUS_LABEL[currentStatus]}
        <CheckIcon className="size-[1.25rem]" />
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
          <span>{ADOPTION_STATUS_LABEL[status]}</span>
          {status === currentStatus && <CheckIcon className="size-[1.25rem]" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

export { AdoptionDetailHero }
