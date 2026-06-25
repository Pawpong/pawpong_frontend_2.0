import { Container } from '@/shared/ui'
import { MOCK_FAVORITE_BREEDERS } from '@/shared/mocks/myHome'
import { BreederCard } from './BreederCard'

const FavoriteBreedersContent = () => {
  const breeders = MOCK_FAVORITE_BREEDERS

  return (
    // 디자인(1023-38692): 모바일 2열 / PC 4열, gap-20. PC는 1188px로 묶어 가운데 정렬
    <Container className="px-4 py-5 tab:py-10">
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 tab:grid-cols-3 tab:gap-5 pc:mx-auto pc:max-w-[74.25rem] pc:grid-cols-4">
        {breeders.map((breeder) => (
          <BreederCard key={breeder.id} breeder={breeder} />
        ))}
      </div>
    </Container>
  )
}

export { FavoriteBreedersContent }
