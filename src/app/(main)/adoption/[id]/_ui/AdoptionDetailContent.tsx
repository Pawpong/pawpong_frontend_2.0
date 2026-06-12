'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Container, Separator, ImageModal } from '@/shared/ui'
import { ArrowBackIcon, MoreVertIcon } from '@/shared/assets/icons'
import { useImageModal } from '@/shared/lib/useImageModal'
import type { AdoptionDetailDto } from '@/shared/types'
import { HealthInfoCard } from './HealthInfoCard'
import { ParentInfoCard } from './ParentInfoCard'
import { BreedingEnvironmentCard } from './BreedingEnvironmentCard'
import { OtherListingCard } from './OtherListingCard'
import { AdoptionDetailHero } from './AdoptionDetailHero'
import { AdoptionCtaBar } from './AdoptionCtaBar'

interface AdoptionDetailContentProps {
  detail: AdoptionDetailDto
}

/* ═══════════════════════════════════════════════
   입양 상세 페이지 오케스트레이터
   - 모바일 서브헤더 + 히어로 + 하단 섹션 + CTA + 이미지 모달
   - 이미지 모달 상태는 히어로/하단 카드가 공유하므로 여기서 보관
   ═══════════════════════════════════════════════ */
const AdoptionDetailContent = ({ detail }: AdoptionDetailContentProps) => {
  const router = useRouter()
  const { imageModalOpen, setImageModalOpen, modalImages, modalInitialIndex, openImageModal } =
    useImageModal(detail.imageUrls)

  return (
    <div className="pb-[6rem] tab:pb-[6rem]">
      {/* ── 네비게이션 바 ── 피그마 976:25819: 뒤로가기 + 가운데 정렬 제목 + 더보기(케밥) px-16 py-4 */}
      <div className="flex items-center px-[1rem] py-[0.25rem] pc:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowBackIcon className="size-[1.5rem] text-[#3e3e3e]" />
        </button>
        <div className="flex min-w-px flex-1 items-center justify-center p-[0.125rem]">
          <p className="text-[0.875rem] leading-[1.5] font-semibold whitespace-nowrap text-[#3e3e3e]">
            {detail.name}
          </p>
        </div>
        <button type="button">
          <MoreVertIcon className="size-[1.5rem] text-[#3e3e3e]" />
        </button>
      </div>

      {/* ═══ 히어로 섹션 ═══ */}
      <AdoptionDetailHero detail={detail} onImageClick={openImageModal} />

      {/* ═══ 하단 콘텐츠 ═══ 피그마 tab: 섹션별 컨테이너 px-48 py-12 */}
      {/* [refactored] 반복되던 <Container className="tab:py-[0.75rem]"> 를 Section으로 추출 */}
      {/* 건강 정보 + 부모 정보 */}
      <Section>
        <div className="mt-[1.25rem] tab:mt-0 pc:flex pc:gap-[1.25rem]">
          <HealthInfoCard detail={detail} />
          <ParentInfoCard detail={detail} onImageClick={openImageModal} />
        </div>
      </Section>

      {/* 사육 환경 */}
      <Section>
        <div className="mt-[1.25rem] tab:mt-0">
          <BreedingEnvironmentCard detail={detail} onImageClick={openImageModal} />
        </div>
      </Section>

      {/* 브리더의 다른 분양건 — 피그마: 컬럼 920px 중앙(외곽서 260px), 제목 위 48px, gap 39px */}
      <Section>
        <div className="mt-[1.5rem] tab:mt-0">
          <Separator className="bg-[#d4d4d4]" />
          <div className="mt-[1rem] flex flex-col gap-[0.75rem] pc:mx-auto pc:mt-[3rem] pc:max-w-[57.5rem] pc:gap-[2.4375rem]">
            <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d] pc:text-[1.25rem] pc:font-semibold pc:text-[#3e3e3e]">
              브리더의 다른 분양건 {detail.otherListings.length}
            </p>
            {detail.otherListings.map((listing) => (
              <OtherListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ CTA 하단 고정 바 ═══ */}
      <AdoptionCtaBar listingId={detail.listingId} chatCount={detail.chatCount} />

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

// [refactored] 하단 섹션 공용 컨테이너 (피그마 tab: py-12) — 반복 className 제거
const Section = ({ children }: { children: ReactNode }) => (
  <Container className="tab:py-[0.75rem]">{children}</Container>
)

export { AdoptionDetailContent }
