import { createPageMetadata } from '@/shared/lib/metadata'

import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { AdoptionShowcase } from '@/widgets/adoption-showcase'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { CategoryBrowse } from '@/features/category-browse'
import { CareMapEntry } from '@/widgets/care-map-entry'

export const metadata = createPageMetadata({
  title: '포퐁',
  description:
    '새로운 가족과의 만남, 포퐁. 반려동물을 만나고 브리더와 소통하며 우리 아이의 일상을 나눠보세요.',
  path: '/',
})

const HomePage = () => {
  return (
    <div>
      <Banner />

      <CategoryBrowse />
      <CareMapEntry />

      <HallOfFame />
      <AdoptionShowcase />
      <CommunityShowcase />
    </div>
  )
}

export default HomePage
