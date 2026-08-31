'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Container, Separator, ImageDetailModal, NavigationBar } from '@/shared/ui'
import { useImageModal } from '@/shared/lib/useImageModal'
import { useToggleAdoptionFavorite } from '@/features/adoption'
import { useMe } from '@/features/auth'
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
  const { me } = useMe()

  // 내 분양글에는 신청 CTA 자체를 두지 않는다 (자기 개체에 신청할 일이 없다)
  const isMyListing = !!me && me.userId === detail.breeder.id

  // 서버가 어차피 거절하는 경우를 버튼 단계에서 알린다 —
  // 신청 생성은 status: 'available' 인 펫만 받고(findApplicablePet), adopter role 전용이다.
  // 비로그인은 그대로 노출해 신청 페이지에서 로그인 유도 흐름을 타게 둔다.
  const applyBlockedReason =
    detail.status === 'adopted'
      ? '분양이 완료된 개체예요'
      : detail.status === 'reserved'
        ? '예약 중인 개체예요'
        : me?.role === 'breeder'
          ? '브리더 계정은 입양 신청을 할 수 없어요'
          : undefined

  return (
    <div className="pb-[6rem] tab:pb-[6rem]">
      {/* Figma 976:25819 — 공용 40px 뒤로가기와 가운데 제목. 동작 없는 케밥은 노출하지 않는다. */}
      <NavigationBar title={detail.name} onBack={() => router.back()} className="pc:hidden" />

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
      {!isMyListing && (
        <AdoptionCtaBar
          listingId={detail.listingId}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          applyBlockedReason={applyBlockedReason}
        />
      )}

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
