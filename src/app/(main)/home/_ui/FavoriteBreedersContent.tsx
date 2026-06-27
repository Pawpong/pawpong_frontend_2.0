import { ChevronIcon } from '@/shared/assets/icons'
import { Container } from '@/shared/ui'
import { MOCK_FAVORITE_BREEDERS } from '@/shared/mocks/myHome'
import { BreederCard } from './BreederCard'

const FavoriteBreedersContent = () => {
  const breeders = MOCK_FAVORITE_BREEDERS

  return (
    <>
      {/* 모바일 전용: 나만 보기 버튼 (디자인 1023-39468 · 1023-39688) */}
      {/* ponytail: 필터 동작 미연결, 실데이터 붙을 때 드롭다운 연결 */}
      <div className="px-4 pt-5 tab:hidden">
        <button type="button" className="flex h-10 items-center gap-1 rounded-lg bg-[#3e3e3e] px-2">
          <span className="text-base leading-[1.5] font-semibold text-[#f6f6f6]">나만 보기</span>
          <ChevronIcon className="size-4 text-[#f6f6f6]" />
        </button>
      </div>

      {/* 디자인(1023-38692): 모바일 2열 / PC 4열, gap-20. PC는 1188px로 묶어 가운데 정렬 */}
      <Container className="px-4 py-5 tab:py-10 pc:pb-27">
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 tab:grid-cols-3 tab:gap-5 pc:mx-auto pc:max-w-[74.25rem] pc:grid-cols-4">
          {breeders.map((breeder) => (
            <BreederCard key={breeder.id} breeder={breeder} />
          ))}
        </div>
      </Container>
    </>
  )
}

export { FavoriteBreedersContent }
