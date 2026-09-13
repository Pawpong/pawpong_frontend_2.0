import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { AdoptionShowcase } from '@/widgets/adoption-showcase'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { CategoryBrowse } from '@/features/category-browse'
import { HomeCta } from '@/widgets/home-cta'

const HomePage = () => {
  return (
    <div>
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
