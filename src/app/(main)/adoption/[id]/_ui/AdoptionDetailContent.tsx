'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Container, Separator, ImageDetailModal } from '@/shared/ui'
import { ArrowBackIcon, MoreVertIcon } from '@/shared/assets'
import { useImageModal } from '@/shared/lib/useImageModal'
import { useToggleAdoptionFavorite } from '@/features/adoption'
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
   - 관심 상태도 히어로(pc)/CTA바(모바일·탭)가 공유하므로 여기서 보관
   ═══════════════════════════════════════════════ */
const AdoptionDetailContent = ({ detail }: AdoptionDetailContentProps) => {
  const router = useRouter()
  const { imageModalOpen, setImageModalOpen, modalImages, modalInitialIndex, openImageModal } =
    useImageModal(detail.imageUrls)
  // listingId = petId (mapAdoptionDetail)
  const { isFavorite, toggleFavorite } = useToggleAdoptionFavorite(
    detail.listingId,
    detail.isFavorited,
  )

  return (
    <div className="pb-[6rem] tab:pb-[6rem]">
      {/* ── 네비게이션 바 ── 피그마 976:25819: 뒤로가기 + 가운데 정렬 제목 + 더보기(케밥) px-16 py-4 */}
      <div className="flex items-center px-[1rem] py-[0.25rem] pc:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowBackIcon className="size-[1.5rem] text-neutral-850" />
        </button>
        <div className="flex min-w-px flex-1 items-center justify-center p-[0.125rem]">
          <p className="text-[0.875rem] leading-[1.5] font-semibold whitespace-nowrap text-neutral-850">
            {detail.name}
          </p>
        </div>
        <button type="button">
          <MoreVertIcon className="size-[1.5rem] text-neutral-850" />
        </button>
      </div>

      {/* ═══ 히어로 섹션 ═══ */}
      <AdoptionDetailHero
        detail={detail}
        onImageClick={openImageModal}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />

      {/* ═══ 하단 콘텐츠 ═══ 피그마 tab: 섹션별 컨테이너 px-48 py-12 */}
      {/* [refactored] 반복되던 <Container className="tab:py-[0.75rem] pc:py-[1.25rem]"> 를 Section으로 추출 */}
      {/* 건강 + 부모 + 사육 — pc: 좌(건강↑/사육↓) | 우(부모 전체 높이) grid / 모바일·탭: 세로 (Figma 1226-54550) */}
      <Section>
        <div className="pc:grid pc:grid-cols-[55.75rem_minmax(0,1fr)] pc:gap-[1.75rem]">
          <HealthInfoCard detail={detail} />
          <ParentInfoCard detail={detail} onImageClick={openImageModal} />
          <BreedingEnvironmentCard
            detail={detail}
            onImageClick={openImageModal}
            className="mt-[1.5rem] pc:col-start-1 pc:row-start-2 pc:mt-0"
          />
        </div>
      </Section>

      {/* 브리더의 다른 분양건 — 피그마: 컬럼 920px 중앙(외곽서 260px), 제목 위 48px, gap 39px */}
      <Section>
        <Separator className="bg-[#d4d4d4]" />
        <div className="mt-[1rem] flex flex-col gap-[0.75rem] pc:mx-auto pc:mt-[3rem] pc:max-w-[57.5rem] pc:gap-2">
          <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d] pc:text-[1.25rem] pc:leading-[1.5] pc:font-semibold pc:text-neutral-850">
            브리더의 다른 분양건 {detail.otherListings.length}
          </p>
          <div className="flex flex-col gap-[0.75rem] pc:gap-6">
            {detail.otherListings.map((listing) => (
              <OtherListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ CTA 하단 고정 바 ═══ */}
      <AdoptionCtaBar
        listingId={detail.listingId}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />

      {/* ═══ 이미지 모달 — 공통 ImageDetailModal (Figma 1952-260350: 이미지+대표뱃지+캐러셀만,
          프로필/소개/투표/버튼 없음) ═══ */}
      <ImageDetailModal
        images={modalImages}
        initialIndex={modalInitialIndex}
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        representativeIndex={0}
        showActions={false}
      />
    </div>
  )
}

// [refactored] 하단 섹션 공용 컨테이너 — 섹션 패딩: 모바일 12/16, 탭 12/48, pc 20/80 (px는 Container 기본)
const Section = ({ children }: { children: ReactNode }) => (
  <Container className="px-[1rem] py-[0.75rem] pc:py-[1.25rem]">{children}</Container>
)

export { AdoptionDetailContent }
