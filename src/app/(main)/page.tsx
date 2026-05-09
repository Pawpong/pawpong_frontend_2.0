import { Container } from '@/shared/ui'
import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { FaqSection } from '@/widgets/faq'
import { SearchBar, PopularKeywords } from '@/features/search'
import { CategoryBrowse } from '@/features/category-browse'

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
      <FaqSection />

      <div className="h-[22rem] bg-[#d9d9d9]" />
    </div>
  )
}

export default HomePage
