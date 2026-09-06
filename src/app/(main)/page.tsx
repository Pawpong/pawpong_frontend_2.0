import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { AdoptionShowcase } from '@/widgets/adoption-showcase'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { CategoryBrowse } from '@/features/category-browse'
import { SearchSection } from '@/features/search'
import { HomeCta } from '@/widgets/home-cta'

//QA: 홈 순서 수정 — 검색바를 배너 위에 배치하고 이후 기존 홈 섹션 순서는 유지한다.
const HomePage = () => {
  return (
    <div>
      {/* //QA: 홈 검색바 추가 — 배너 위에 Figma 검색 레이아웃과 인기 검색어를 배치한다. */}
      <SearchSection variant="home" showPopularKeywords />
      <Banner />
      <HomeCta />

      <CategoryBrowse />

      <HallOfFame />
      <AdoptionShowcase />
      <CommunityShowcase />
    </div>
  )
}

export default HomePage
