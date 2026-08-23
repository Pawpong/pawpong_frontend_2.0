import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { AdoptionShowcase } from '@/widgets/adoption-showcase'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { SearchSection } from '@/features/search'
import { CategoryBrowse } from '@/features/category-browse'

// 데스크탑 홈 순서: 검색 → 배너 → 브리더 CTA·카테고리 → 명예의 동물 → 분양중인 동물 → 커뮤니티 카드
const HomePage = () => {
  return (
    <div>
      <SearchSection showPopularKeywords />

      <Banner />

      <CategoryBrowse />

      <HallOfFame />
      <AdoptionShowcase />
      <CommunityShowcase />
    </div>
  )
}

export default HomePage
