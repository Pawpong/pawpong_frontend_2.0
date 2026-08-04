'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronIcon } from '@/shared/assets/icons'
import { Container, InfiniteScrollTrigger } from '@/shared/ui'
import { formatDate } from '@/shared/lib/formatDate'
import { uniqueBy } from '@/shared/lib/uniqueBy'
import { profileQueries } from '@/entities/profile'
import type { FavoriteBreederCard } from '@/shared/types'
import type { FavoriteBreeder } from '@/shared/mocks/myHome'
import { BreederCard } from './BreederCard'

// 즐겨찾는 브리더 카드(API) → BreederCard 뷰모델. badges/date 는 BreederCard 가 렌더하지 않는 충족용 필드.
const toFavoriteBreeder = (b: FavoriteBreederCard): FavoriteBreeder => ({
  id: b.breederId,
  nickname: b.nickname,
  imageUrl: b.profileImageUrl ?? null,
  badges: [],
  isBreeding: b.recentPetStatus === 'available',
  location: b.breederLocation,
  date: formatDate(b.addedAt),
})

const FavoriteBreedersContent = () => {
  // 즐겨찾는 브리더 — /profile/me/favorite-breeders (adopter 전용, 무한 스크롤)
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(profileQueries.favoriteBreeders())

  // 무한스크롤 페이지 병합 시 브리더 id 중복 제거 (React key 중복 방어)
  const breeders = uniqueBy(
    (data?.pages.flatMap((page) => page.items) ?? []).map(toFavoriteBreeder),
    (breeder) => breeder.id,
  )

  return (
    <>
      {/* 모바일 전용: 나만 보기 버튼 (디자인 1023-39468 · 1023-39688) */}
      {/* ponytail: 필터 동작 미연결, 실데이터 붙을 때 드롭다운 연결 */}
      <div className="px-4 pt-5 tab:hidden">
        <button
          type="button"
          className="flex h-10 items-center gap-1 rounded-lg bg-neutral-850 px-2"
        >
          <span className="text-base leading-[1.5] font-semibold text-neutral-50">나만 보기</span>
          <ChevronIcon className="size-4 text-neutral-50" />
        </button>
      </div>

      {/* 디자인(1023-38692): 모바일 2열 / PC 4열, gap-20. PC는 1188px로 묶어 가운데 정렬 */}
      <Container className="px-4 py-5 tab:py-10 pc:pb-27">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-neutral-700">불러오는 중...</p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-neutral-700">
            즐겨찾는 브리더를 불러오지 못했습니다.
          </p>
        ) : breeders.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-700">즐겨찾는 브리더가 없습니다.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 tab:grid-cols-3 tab:gap-5 pc:mx-auto pc:max-w-[74.25rem] pc:grid-cols-4">
              {breeders.map((breeder) => (
                <BreederCard key={breeder.id} breeder={breeder} />
              ))}
            </div>
            <InfiniteScrollTrigger
              onIntersect={fetchNextPage}
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage}
            />
          </>
        )}
      </Container>
    </>
  )
}

export { FavoriteBreedersContent }
