'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Badge,
  Container,
  FavoriteButton,
  ListingStats,
  Separator,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'
import {
  ArrowBackIcon,
  ArrowRightIcon,
  CheckIcon,
  GenderIcon,
  PixelArrowRightIcon,
  ShareIcon,
} from '@/shared/assets/icons'
import { useImageModal } from '@/shared/lib/useImageModal'
import { useImageCarousel } from '@/shared/lib/useImageCarousel'
import type { AdoptionDetailDto, AdoptionStatus } from '@/shared/types'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
import { HealthInfoCard } from './HealthInfoCard'
import { ParentInfoCard } from './ParentInfoCard'
import { BreedingEnvironmentCard } from './BreedingEnvironmentCard'
import { OtherListingCard } from './OtherListingCard'
import { ImageModal } from '@/shared/ui'

interface AdoptionDetailContentProps {
  detail: AdoptionDetailDto
}

/* ═══════════════════════════════════════════════
   입양 상세 페이지 메인 컴포넌트
   - 모바일(375px): 세로 단일 컬럼
   - 데스크탑(1280px): 좌측 이미지 + 우측 정보 2컬럼
   ═══════════════════════════════════════════════ */
const AdoptionDetailContent = ({ detail }: AdoptionDetailContentProps) => {
  const router = useRouter()
  // [refactored] 캐러셀 상태/네비 로직은 HeroImageCarousel로 이동
  const { imageModalOpen, setImageModalOpen, modalImages, modalInitialIndex, openImageModal } =
    useImageModal(detail.imageUrls)

  return (
    <div className="pb-[6rem] tab:pb-[6rem]">
      {/* ── 모바일 서브헤더 ── */}
      <div className="flex items-center gap-[0.625rem] px-[1.25rem] py-[0.75rem] tab:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowBackIcon className="size-[1.25rem] text-[#5d5d5d]" />
        </button>
        <p className="text-[0.875rem] leading-[1.5] font-semibold text-[#5d5d5d]">{detail.name}</p>
      </div>

      {/* ═══ 히어로 섹션 (브레드크럼 + 이미지 + 프로필 | 정보) ═══ */}
      {/* [refactored] 공용 Container 사용 (모바일은 풀블리드 이미지 위해 px-0) */}
      <Container className="px-0 tab:px-[3rem] tab:py-[1.25rem]">
        <div className="tab:flex tab:items-start tab:gap-[1.25rem]">
          {/* ── 좌측 섹션: 브레드크럼 + 이미지 + 브리더 프로필 ── 피그마: w-500, gap-12 */}
          <div className="relative tab:flex tab:w-[31.25rem] tab:shrink-0 tab:flex-col tab:gap-[0.75rem]">
            {/* 브레드크럼 (데스크탑 전용) — 피그마: 라벨(body/md/bold 14px #6b6b6b) + chevron */}
            <div className="hidden items-end py-[0.625rem] tab:flex">
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
            {/* [refactored] 캐러셀 블록을 HeroImageCarousel로 추출 */}
            <HeroImageCarousel
              images={detail.imageUrls}
              alt={detail.name}
              onImageClick={(index) => openImageModal(detail.imageUrls, index)}
            />

            {/* ── 브리더 프로필 (데스크탑 전용) ── */}
            {/* 피그마: 아바타 + 닉네임 + 애정도 배지 ··· 브리더홈 > */}
            <div className="hidden items-center gap-[1.75rem] tab:flex">
              <div className="flex flex-1 items-center gap-[1.25rem]">
                <div className="flex items-center gap-[0.5rem]">
                  <div className="relative size-[2.5rem] shrink-0 overflow-hidden rounded-full bg-[#d4d4d4]">
                    <Image
                      src={detail.breeder.profileImageUrl}
                      alt={detail.breeder.nickname}
                      fill
                      className="object-cover"
                    />
                  </div>
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

          {/* ── 우측 섹션: 이름 ~ 관심/공유 ── 피그마: flex-1, py-48, items-end, justify-between */}
          <div className="flex flex-col px-[1.25rem] pt-[0.75rem] tab:flex-1 tab:items-end tab:justify-between tab:self-stretch tab:px-0 tab:py-[3rem]">
            {/* 브리더 프로필 (모바일만 여기서 표시) */}
            <div className="w-full tab:hidden">
              <div className="flex items-center gap-[0.375rem]">
                <div className="relative size-[2.75rem] shrink-0 overflow-hidden rounded-full bg-[#d4d4d4]">
                  <Image
                    src={detail.breeder.profileImageUrl}
                    alt={detail.breeder.nickname}
                    fill
                    className="object-cover"
                  />
                </div>
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
              <div className="flex flex-wrap items-center gap-[0.4375rem] tab:gap-[0.5rem]">
                <p className="text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[1.5rem] tab:text-[#3e3e3e]">
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
                <p className="text-[0.75rem] leading-[1.5] font-medium tab:text-[1.25rem] tab:text-[#6b6b6b]">
                  소개
                </p>
                <p className="text-[0.875rem] leading-[1.5] font-semibold whitespace-pre-wrap tab:text-[1rem] tab:text-[#3e3e3e]">
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
              className="mt-[0.5rem] justify-end tab:hidden"
            />

            {/* ── 하단 그룹: 문의/관심/조회 + 관심/공유 (데스크탑 전용) ── */}
            <div className="hidden flex-col items-end gap-[0.5rem] tab:flex">
              <ListingStats
                inquiryCount={detail.inquiryCount}
                favoriteCount={detail.favoriteCount}
                viewCount={detail.viewCount}
                size="lg"
              />
              {/* 피그마 1211-53502: 관심있어요 + 공유 (아이콘 32, gap-0, 텍스트 12px semibold #3e3e3e, 행 gap-16) */}
              <div className="flex items-center gap-[1rem]">
                <FavoriteButton
                  size="lg"
                  className="gap-0 p-0 text-[0.75rem] font-semibold text-[#3e3e3e]"
                  iconClassName="size-[2rem]"
                />
                <button
                  type="button"
                  className="flex items-center gap-0 text-[0.75rem] font-semibold text-[#3e3e3e]"
                >
                  <ShareIcon className="size-[2rem]" />
                  <span>공유</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ═══ 하단 콘텐츠 — [refactored] 히어로와 동일 공용 Container 사용 ═══ */}
      <Container className="tab:py-[1.25rem]">
        {/* 건강 정보 + 부모 정보 섹션 */}
        <div className="mt-[1.25rem] tab:mt-0 tab:flex tab:gap-[1.25rem]">
          <HealthInfoCard detail={detail} />
          <ParentInfoCard detail={detail} onImageClick={openImageModal} />
        </div>

        {/* 사육 환경 섹션 */}
        <div className="mt-[1.25rem] tab:mt-[2rem]">
          <BreedingEnvironmentCard detail={detail} onImageClick={openImageModal} />
        </div>

        {/* 브리더의 다른 분양 동물 */}
        <div className="mt-[1.5rem] tab:mt-[2rem]">
          <Separator className="mb-[1rem] bg-[#d4d4d4]" />
          <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d] tab:text-[1.25rem] tab:font-semibold">
            브리더의 다른 분양 동물 {detail.otherListings.length}
          </p>
          <div className="mt-[0.75rem] flex flex-col gap-[0.75rem] tab:mt-[1.3125rem] tab:gap-[1.3125rem]">
            {detail.otherListings.map((listing) => (
              <OtherListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        </div>
      </Container>

      {/* ═══ CTA 하단 고정 바 ═══ */}
      <div className="fixed right-0 bottom-0 left-0 z-10 bg-white p-[1.25rem] tab:flex tab:items-center tab:justify-center tab:py-[1.4375rem]">
        <div className="flex items-center gap-[0.625rem] tab:w-auto">
          <Link
            href={`/adoption/${detail.listingId}/apply`}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] tab:w-[29.75rem] tab:flex-initial"
          >
            대화중인 채팅 {detail.chatCount}
          </Link>
        </div>
      </div>

      {/* ═══ 이미지 모달 ═══ */}
      <ImageModal
        images={modalImages}
        initialIndex={modalInitialIndex}
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
      />
    </div>
  )
}

/* ── 히어로 이미지 캐러셀 (이미지 + 모바일 공유 + 좌우 네비 + 인디케이터) ── */
// [refactored] 캐러셀 상태/UI를 한 컴포넌트로 분리, prev/next는 공용 useImageCarousel 재사용
const HeroImageCarousel = ({
  images,
  alt,
  onImageClick,
}: {
  images: string[]
  alt: string
  onImageClick: (index: number) => void
}) => {
  const { currentIndex, handlePrev, handleNext } = useImageCarousel(images)
  const hasMultiple = images.length > 1

  return (
    <div className="relative aspect-[375/279] w-full overflow-hidden tab:flex tab:aspect-square tab:h-[31.25rem] tab:w-[31.25rem] tab:items-center tab:justify-center tab:self-stretch tab:rounded-[0.5rem]">
      <button
        type="button"
        onClick={() => onImageClick(currentIndex)}
        className="relative block size-full"
      >
        <Image src={images[currentIndex]} alt={alt} fill className="object-cover" />
      </button>

      {/* 공유 버튼 (모바일) */}
      <button type="button" className="absolute top-[0.75rem] right-[0.75rem] tab:hidden">
        <ShareIcon className="size-[2rem] text-white" />
      </button>

      {/* 좌우 슬라이드 네비게이션 — 피그마: pixel arrow_right (#f6f6f6) */}
      {hasMultiple && (
        <>
          <SlideNavButton
            label="이전 사진"
            onClick={handlePrev}
            className="left-[1.25rem] rotate-180"
          />
          <SlideNavButton label="다음 사진" onClick={handleNext} className="right-[1.25rem]" />
        </>
      )}

      {/* 인디케이터 — 피그마: 활성 pill(20x8 #fffa94), 비활성 dot(8 #a9835a) */}
      <div className="absolute bottom-[1rem] left-1/2 flex -translate-x-1/2 items-center gap-[0.25rem] tab:bottom-[1.5rem]">
        {images.map((url, index) => (
          <span
            key={url}
            className={
              index === currentIndex
                ? 'h-[0.5rem] w-[1.25rem] rounded-[0.5rem] bg-[#fffa94]'
                : 'size-[0.5rem] rounded-[0.5rem] bg-[#a9835a]'
            }
          />
        ))}
      </div>
    </div>
  )
}

/* ── 좌우 슬라이드 네비 버튼 ── */
// [refactored] 동일 마크업의 prev/next 버튼 중복 제거
const SlideNavButton = ({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className: string
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`absolute top-1/2 -translate-y-1/2 ${className}`}
  >
    <PixelArrowRightIcon className="size-[3rem] text-[#f6f6f6]" />
  </button>
)

/* ── 정보 항목 (라벨 ↔ 내용: 데스크탑에서 가로 배치 gap-12px) ── */
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
    <p className="shrink-0 text-[0.75rem] leading-[1.5] font-medium tab:text-[1.25rem] tab:text-[#6b6b6b]">
      {label}
    </p>
    <div className="flex items-center gap-[0.25rem]">
      <p className="text-[0.875rem] leading-[1.5] font-semibold tab:text-[1.25rem] tab:text-[#3e3e3e]">
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
        className="inline-flex items-center gap-[0.625rem] rounded-full bg-[#5d5d5d] px-[0.625rem] py-[0.25rem] text-[0.75rem] leading-[1.375rem] font-semibold text-white tab:text-[0.875rem]"
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

export { AdoptionDetailContent }
