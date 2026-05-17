import { AdoptionDetailContent } from './_ui/AdoptionDetailContent'
import { MOCK_ADOPTION_DETAIL } from '@/shared/mocks/adoption'

const AdoptionDetailPage = () => {
  const detail = MOCK_ADOPTION_DETAIL

  return <AdoptionDetailContent detail={detail} />
}

export default AdoptionDetailPage
