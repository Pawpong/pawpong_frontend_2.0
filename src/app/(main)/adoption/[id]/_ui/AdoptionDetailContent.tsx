'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, FavoriteButton, ListingStats, Separator } from '@/shared/ui'
import { ArrowBackIcon, FavoriteIcon, ShareIcon } from '@/shared/assets/icons'
import type { AdoptionDetailDto } from '@/shared/types'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
import { HealthInfoCard } from './HealthInfoCard'
import { ParentInfoCard } from './ParentInfoCard'
import { BreedingEnvironmentCard } from './BreedingEnvironmentCard'
import { OtherListingCard } from './OtherListingCard'

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  return (
    <div className="pb-[6rem] tab:pb-[6rem]">
      {/* ── 모바일 서브헤더 ── */}
      <div className="flex items-center gap-[0.625rem] px-[1.25rem] py-[0.75rem] tab:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowBackIcon className="size-[1.25rem] text-[#5d5d5d]" />
        </button>
        <p className="text-[0.875rem] font-semibold leading-[1.5] text-[#5d5d5d]">
          {detail.name}
        </p>
      </div>

      {/* ── 데스크탑 브레드크럼 ── */}
      <div className="hidden tab:block tab:px-[3rem] tab:py-[0.75rem] pc:px-[6.25rem]">
        <p className="text-[0.875rem] font-medium leading-[1.375rem] text-[#a8a8a8]">
          <span>홈 &gt; 입양 </span>
          <span className="text-[#5d5d5d]">&gt; 도마뱀</span>
        </p>
      </div>

      {/* ═══ 히어로 섹션 (이미지 + 기본정보) ═══ */}
      <div className="tab:px-[3rem] pc:px-[6.25rem]">
        {/* 데스크탑: 이미지 + 우측 정보 2컬럼 */}
        <div className="tab:flex tab:gap-[2rem]">
          {/* ── 이미지 영역 ── */}
          <div className="relative tab:w-[27.5rem] tab:shrink-0">
            <div className="relative aspect-[375/279] w-full overflow-hidden tab:aspect-[440/443] tab:rounded-[1rem]">
              <Image
                src={detail.imageUrls[currentImageIndex]}
                alt={detail.name}
                fill
                className="object-cover"
              />
              {/* 공유 버튼 (모바일) */}
              <button
                type="button"
                className="absolute right-[0.75rem] top-[0.75rem] tab:hidden"
              >
                <ShareIcon className="size-[2rem] text-white" />
              </button>
              {/* 이미지 카운터 */}
              <div className="absolute bottom-[1rem] left-1/2 -translate-x-1/2 rounded-full bg-[#2f2f2f] px-[0.625rem] tab:bottom-[1.5rem]">
                <span className="text-[0.75rem] leading-[1.375rem] text-white tab:text-[0.875rem]">
                  {currentImageIndex + 1} / {detail.imageUrls.length}
                </span>
              </div>
            </div>
          </div>

          {/* ── 우측 기본 정보 (데스크탑에서는 이미지 옆) ── */}
          <div className="flex flex-col px-[1.25rem] pt-[0.75rem] tab:flex-1 tab:px-0 tab:pt-0">
            {/* 브리더 프로필 (모바일만 여기서 표시) */}
            <div className="tab:hidden">
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
                  <p className="text-[0.875rem] font-bold leading-[1.5] text-[#5d5d5d]">
                    {detail.breeder.nickname}
                  </p>
                  <p className="text-[0.75rem] font-semibold leading-[1.5] text-[#5d5d5d]">
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

            {/* 이름 + 상태 배지 + 인기 배지 */}
            <div className="flex flex-wrap items-center gap-[0.4375rem] tab:gap-[0.5rem]">
              <p className="text-[0.875rem] font-bold leading-[1.375rem] text-[#5d5d5d] tab:text-[1.25rem]">
                {detail.name}
              </p>
              <Badge
                variant="status"
                className="h-[1.5rem] px-[0.625rem] py-[0.25rem] text-[0.75rem] leading-[1.375rem] tab:text-[0.875rem]"
              >
                {ADOPTION_STATUS_LABEL[detail.status]}
              </Badge>
              {detail.isPopular && (
                <Badge
                  variant="outline"
                  className="h-[1.375rem] bg-white px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
                >
                  인기🔥
                </Badge>
              )}
            </div>

            {/* 분양가 */}
            <div className="mt-[0.25rem] flex items-center gap-[0.5rem] text-[#5d5d5d]">
              <span className="text-[0.75rem] font-bold leading-[1.375rem] tab:text-[1rem]">
                분양가 :
              </span>
              <span className="text-[0.875rem] font-bold leading-[1.375rem] tab:text-[1.25rem]">
                {detail.price}
              </span>
            </div>

            {/* 상세 정보 (태어난 날, 성별, 소개) */}
            <div className="mt-[0.875rem] flex flex-col gap-[0.875rem] tab:mt-[1.5rem] tab:gap-[1.5rem]">
              <InfoItem
                label="태어난 날"
                value={detail.birthDate}
              />
              <InfoItem
                label="성별"
                value={GENDER_LABEL[detail.gender]}
              />
              <div className="flex flex-col text-[#5d5d5d]">
                <p className="text-[0.75rem] font-medium leading-[1.375rem] tab:text-[1rem]">
                  우리 아이를 소개합니다 !
                </p>
                <p className="whitespace-pre-wrap text-[0.875rem] font-semibold leading-[1.5] tab:text-[1.25rem] tab:leading-[1.375rem]">
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
          </div>
        </div>

        {/* ── 브리더 프로필 + 관심/공유 행 (데스크탑 전용) ── */}
        {/* 피그마: 아바타(50) left:100 | 닉네임/위치 | BPM left:449 ··· 문의/관심/조회 + 관심/공유 우측 끝 */}
        <div className="hidden tab:mt-[1rem] tab:flex tab:items-start">
          {/* 좌: 아바타 + 닉네임/위치 (이미지 너비에 맞춤 27.5rem) */}
          <div className="flex w-[27.5rem] shrink-0 items-center gap-[1rem]">
            <div className="relative size-[3.125rem] shrink-0 overflow-hidden rounded-full bg-[#d4d4d4]">
              <Image
                src={detail.breeder.profileImageUrl}
                alt={detail.breeder.nickname}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-[1rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
                {detail.breeder.nickname}
              </p>
              <p className="text-[1rem] font-medium leading-[1.375rem] text-[#5d5d5d]">
                {detail.breeder.location}
              </p>
            </div>
            <Badge
              variant="outline"
              className="ml-auto px-[0.625rem] py-[0.25rem] text-[0.875rem] leading-[1.375rem]"
            >
              {detail.breeder.bpm} BPM
            </Badge>
          </div>
          {/* 우: 문의/관심/조회 + 관심/공유 (우측 정보 영역) */}
          <div className="ml-[2rem] flex flex-1 flex-col items-end gap-[1.0625rem]">
            <ListingStats
              inquiryCount={detail.inquiryCount}
              favoriteCount={detail.favoriteCount}
              viewCount={detail.viewCount}
              size="lg"
            />
            <div className="flex items-center gap-[0.625rem]">
              <FavoriteButton size="lg" />
              <button
                type="button"
                className="flex items-center gap-[0.625rem] rounded-full p-[0.625rem] text-[0.875rem] font-medium text-[#5d5d5d]"
              >
                <ShareIcon className="size-[1.5rem]" />
                <span>공유</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ═══ 건강 정보 + 부모 정보 섹션 ═══ */}
      <div className="mt-[1.25rem] px-[1.25rem] tab:mt-[2rem] tab:flex tab:gap-[1.25rem] tab:px-[3rem] pc:px-[6.25rem]">
        {/* 건강 정보 카드 */}
        <HealthInfoCard detail={detail} />
        {/* 부모 정보 카드 */}
        <ParentInfoCard detail={detail} />
      </div>

      {/* ═══ 사육 환경 섹션 ═══ */}
      <div className="mt-[1.25rem] px-[1.25rem] tab:mt-[2rem] tab:px-[3rem] pc:px-[6.25rem]">
        <BreedingEnvironmentCard detail={detail} />
      </div>

      {/* ═══ 브리더의 다른 분양 동물 ═══ */}
      <div className="mt-[1.5rem] px-[1.25rem] tab:mt-[2rem] tab:px-[3rem] pc:px-[6.25rem]">
        <Separator className="mb-[1rem] bg-[#d4d4d4]" />
        <p className="text-[0.75rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1.25rem] tab:font-semibold">
          브리더의 다른 분양 동물 {detail.otherListings.length}
        </p>
        <div className="mt-[0.75rem] flex flex-col gap-[0.75rem] tab:mt-[1.3125rem] tab:gap-[1.3125rem]">
          {detail.otherListings.map((listing) => (
            <OtherListingCard key={listing.listingId} listing={listing} />
          ))}
        </div>
      </div>

      {/* ═══ CTA 하단 고정 바 ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white p-[1.25rem] tab:flex tab:items-center tab:justify-center tab:py-[1.4375rem]">
        <div className="flex items-center gap-[0.625rem] tab:w-auto">
          {/* 관심 버튼 (모바일만) */}
          <button type="button" className="shrink-0 tab:hidden">
            <FavoriteIcon className="size-[2rem] text-[#5d5d5d]" />
          </button>
          <button
            type="button"
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] tab:w-[33.0625rem] tab:flex-initial"
          >
            입양 신청
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 정보 항목 (태어난 날, 성별) ── */
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col text-[#5d5d5d]">
    <p className="text-[0.75rem] font-medium leading-[1.375rem] tab:text-[1rem]">
      {label}
    </p>
    <p className="text-[0.875rem] font-semibold leading-[1.5] tab:text-[1.25rem] tab:leading-[1.375rem]">
      {value}
    </p>
  </div>
)

export { AdoptionDetailContent }
