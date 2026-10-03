import { getAdoptionMetadata } from '@/app/_lib/contentMetadata'
import { AdoptionDetailPageClient } from './_ui/AdoptionDetailPageClient'

// 공유 미리보기용 메타만 서버에서 만들고, 화면은 기존 클라이언트 조회 그대로 그린다
export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }) =>
  getAdoptionMetadata((await params).id)

const AdoptionDetailPage = () => <AdoptionDetailPageClient />

export default AdoptionDetailPage
