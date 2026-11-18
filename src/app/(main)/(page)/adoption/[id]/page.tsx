import { adoptionQueries } from '@/entities/adoption'
import { getAdoptionMetadata } from '@/app/_lib/contentMetadata'
import { ServerPrefetch } from '@/app/_lib/ServerPrefetch'
import { AdoptionDetailPageClient } from './_ui/AdoptionDetailPageClient'

interface AdoptionDetailPageProps {
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({ params }: AdoptionDetailPageProps) =>
  getAdoptionMetadata((await params).id)

// 분양글 본문은 서버에서 받아 HTML 에 바로 싣는다. 받는 동안은 loading.tsx 의 스켈레톤이 먼저 간다
const AdoptionDetailPage = async ({ params }: AdoptionDetailPageProps) => {
  const { id } = await params
  return (
    <ServerPrefetch queries={[adoptionQueries.detail(id)]}>
      <AdoptionDetailPageClient />
    </ServerPrefetch>
  )
}

export default AdoptionDetailPage
