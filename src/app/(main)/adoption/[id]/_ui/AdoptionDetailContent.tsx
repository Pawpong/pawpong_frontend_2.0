'use client'

import { useRouter } from 'next/navigation'
import { Container, Separator, ImageModal } from '@/shared/ui'
import { ArrowBackIcon } from '@/shared/assets/icons'
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
      {/* ── 모바일 서브헤더 ── */}
      <div className="flex items-center gap-[0.625rem] px-[1.25rem] py-[0.75rem] tab:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowBackIcon className="size-[1.25rem] text-[#5d5d5d]" />
        </button>
        <p className="text-[0.875rem] leading-[1.5] font-semibold text-[#5d5d5d]">{detail.name}</p>
      </div>

      {/* ═══ 히어로 섹션 ═══ */}
      <AdoptionDetailHero detail={detail} onImageClick={openImageModal} />

      {/* ═══ 하단 콘텐츠 (히어로와 동일 공용 Container) ═══ */}
      <Container className="tab:py-[1.25rem]">
        {/* 건강 정보 + 부모 정보 */}
        <div className="mt-[1.25rem] tab:mt-0 tab:flex tab:gap-[1.25rem]">
          <HealthInfoCard detail={detail} />
          <ParentInfoCard detail={detail} onImageClick={openImageModal} />
        </div>

        {/* 사육 환경 */}
        <div className="mt-[1.25rem] tab:mt-[2rem]">
          <BreedingEnvironmentCard detail={detail} onImageClick={openImageModal} />
        </div>

        {/* 브리더의 다른 분양건 — 피그마: 컬럼 920px 중앙(외곽서 260px), 제목 위 48px, gap 39px */}
        <div className="mt-[1.5rem] tab:mt-[2rem]">
          <Separator className="bg-[#d4d4d4]" />
          <div className="mt-[1rem] flex flex-col gap-[0.75rem] tab:mx-auto tab:mt-[3rem] tab:max-w-[57.5rem] tab:gap-[2.4375rem]">
            <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d] tab:text-[1.25rem] tab:font-semibold tab:text-[#3e3e3e]">
              브리더의 다른 분양건 {detail.otherListings.length}
            </p>
            {detail.otherListings.map((listing) => (
              <OtherListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        </div>
      </Container>

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

export { AdoptionDetailContent }
