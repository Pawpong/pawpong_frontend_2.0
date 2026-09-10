'use client'

import { useRouter } from 'next/navigation'
import {
  Container,
  EmptyState,
  ImageDetailModal,
  ListingCardGrid,
  NavigationBar,
} from '@/shared/ui'
import { useImageModal } from '@/shared/lib/useImageModal'
import { FavoriteAdoptionGridCard, useToggleAdoptionFavorite } from '@/features/adoption'
import { useMe } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import type { AdoptionDetailDto } from '@/shared/types'
import { PHOTO_GRID_COLS } from '../_lib/detailTypography'
import { HealthInfoCard } from './HealthInfoCard'
import { ParentInfoCard } from './ParentInfoCard'
import { BreedingEnvironmentCard } from './BreedingEnvironmentCard'
import { AdoptionDetailRail } from './AdoptionDetailRail'
import { AboutSection } from './AboutSection'
import { DetailSection } from './DetailSection'
import { AdoptionCtaBar } from './AdoptionCtaBar'

interface AdoptionDetailContentProps {
  detail: AdoptionDetailDto
}

/* ═══════════════════════════════════════════════
   입양 상세 페이지 오케스트레이터

   배치: 좌 결정 레일(sticky) | 우 근거 섹션 — 1024+ 에서만 2단으로 갈라진다.
   결정 정보(이미지·이름·상태·분양가·브리더)가 스크롤 내내 시야에 남아,
   "가격 보고 → 내려가 건강 확인 → 다시 올라와 신청" 왕복이 사라진다.

   - 이미지 모달 상태는 레일/부모/사육환경이 공유하므로 여기서 보관
   - 관심 상태도 레일(관심 버튼)/CTA바가 공유하므로 여기서 보관
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

  // 서버가 어차피 거절하는 경우를 버튼 단계에서 알린다 — 신청 생성은 status: 'available' 인
  // 펫만 받는다(findApplicablePet). 브리더 계정도 다른 브리더에게 입양 신청을 넣을 수 있어
  // role 로는 막지 않는다. 비로그인은 그대로 노출해 신청 페이지에서 로그인 유도 흐름을 타게 둔다.
  const applyBlockedReason =
    detail.status === 'adopted'
      ? '분양이 완료된 개체예요'
      : detail.status === 'reserved'
        ? '예약 중인 개체예요'
        : undefined

  // 레일(1024+)과 하단 고정 바(1024 미만)가 같은 값을 쓴다 — 한 곳에서 만든다
  const ctaProps = {
    listingId: detail.listingId,
    isFavorite,
    onToggleFavorite: toggleFavorite,
    applyBlockedReason,
    myApplication: detail.myApplicationId
      ? { applicationId: detail.myApplicationId, breederUserId: detail.breeder.id }
      : undefined,
  }

  return (
    <div className="pb-24 lap:pb-10">
      {/* Figma 976:25819 — 공용 40px 뒤로가기와 가운데 제목. 레일이 이름을 갖고 있어 2단에선 숨긴다. */}
      <NavigationBar title={detail.name} onBack={() => router.back()} className="lap:hidden" />

      <Container className="px-4 py-4 lap:flex lap:items-start lap:gap-8 lap:py-8 pc:gap-10 pc:py-10">
        <AdoptionDetailRail
          detail={detail}
          onImageClick={openImageModal}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          showFavoriteAction={!isMyListing}
          cta={!isMyListing && <AdoptionCtaBar {...ctaProps} variant="inline" />}
        />

        {/* 우측은 근거만 — 스펙 → 건강(강조) → 부모·사육환경 → 다른 분양건 */}
        <div className="flex min-w-0 flex-1 flex-col gap-8 pt-6 lap:gap-12 lap:pt-0">
          <AboutSection detail={detail} />
          <HealthInfoCard detail={detail} />

          {/* 둘 다 사진 위주라 짝지어 놓는다 — 전폭 섹션이 세로로만 늘어지는 것을 한 번 끊는다 */}
          <div className="grid gap-8 tab:grid-cols-2 tab:gap-6 lap:gap-8">
            <ParentInfoCard detail={detail} onImageClick={openImageModal} />
            <BreedingEnvironmentCard detail={detail} onImageClick={openImageModal} />
          </div>

          <DetailSection title={`브리더의 다른 분양건 ${detail.otherListings.length}`}>
            {detail.otherListings.length > 0 ? (
              // 공개 브리더 홈 분양 목록과 같은 그리드 카드 — 같은 정보를 두 화면이 다른
              // 모양으로 보여줄 이유가 없다. 컬럼 폭이 유동이라 열 수는 auto-fill 로 맞춘다
              <ListingCardGrid
                className={cn(PHOTO_GRID_COLS, 'max-w-none justify-normal gap-x-5')}
                items={detail.otherListings}
                getKey={(listing) => listing.listingId}
                renderItem={(listing, index) => (
                  <FavoriteAdoptionGridCard listing={listing} preload={index < 2} />
                )}
              />
            ) : (
              <EmptyState message="브리더의 다른 분양건이 없어요." size="compact" />
            )}
          </DetailSection>
        </div>
      </Container>

      {/* 하단 고정 CTA — 레일에 신청 진입점이 생기는 1024 미만에서만 */}
      {!isMyListing && (
        <div className="lap:hidden">
          <AdoptionCtaBar {...ctaProps} />
        </div>
      )}

      {/* Figma 1952-260350: 이미지+대표뱃지+캐러셀만, 프로필/소개/투표/버튼 없음 */}
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

export { AdoptionDetailContent }
