import { createPageMetadata } from '@/shared/lib/metadata'

import { getInitialBanners } from '@/entities/home/server'
import { Banner } from '@/widgets/banner'
import { HallOfFame } from '@/widgets/hall-of-fame'
import { AdoptionShowcase } from '@/widgets/adoption-showcase'
import { CommunityShowcase } from '@/widgets/community-showcase'
import { CategoryBrowse } from '@/features/category-browse'
import { ManagedFeatureHighlights } from './_ui/ManagedFeatureHighlights'

export const metadata = createPageMetadata({
  title: '포퐁',
  description:
    '새로운 가족과의 만남, 포퐁. 반려동물을 만나고 브리더와 소통하며 우리 아이의 일상을 나눠보세요.',
  path: '/',
})

const HomePage = async () => {
  // 첫 배너를 HTML 에 바로 실어 이미지 요청이 화면 코드·배너 API 를 기다리지 않게 한다.
  const initialBanners = await getInitialBanners()
  return (
    <div>
      <Banner initial={initialBanners} />

      <CategoryBrowse />
      <ManagedFeatureHighlights placement="home" />

      <HallOfFame />
      <AdoptionShowcase />
      <CommunityShowcase />
    </div>
  )
}

export default HomePage
