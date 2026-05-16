import { Container } from '@/shared/ui'
import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { FaqSection } from '@/widgets/faq'
import { SearchBar, PopularKeywords } from '@/features/search'
import { CategoryBrowse } from '@/features/category-browse'
import type { HomeUserType } from '@/shared/types'

// TODO: 인증 구현 후 실제 사용자 유형으로 교체
const userType: HomeUserType = 'adopter'

const HomePage = () => {
  return (
    <div>
      <Banner />

      <Container className="mt-[3rem]">
        <div className="mx-auto max-w-[42.5rem]">
          <SearchBar />
          <PopularKeywords />
        </div>
      </Container>

      <Container className="mt-[3rem]">
        <CategoryBrowse />
      </Container>

      <HallOfFame />
      <CommunityShowcase />
      <FaqSection userType={userType} />

      <div className="h-[22rem] bg-[#d9d9d9]" />
    </div>
  )
}

export default HomePage
