import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { FaqSection } from '@/widgets/faq'
import { SearchSection } from '@/features/search'
import { CategoryBrowse } from '@/features/category-browse'
import type { HomeUserType } from '@/shared/types'

// TODO: 인증 구현 후 실제 사용자 유형으로 교체
const userType: HomeUserType = 'adopter'

const HomePage = () => {
  return (
    <div>
      <Banner />

      <SearchSection />

      <CategoryBrowse />

      <HallOfFame />
      <CommunityShowcase />
      <FaqSection userType={userType} />
    </div>
  )
}

export default HomePage
