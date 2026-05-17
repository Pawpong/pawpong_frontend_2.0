import { MOCK_ADOPTION_DETAIL } from '@/shared/mocks/adoption'
import { ApplicationForm } from './_ui/ApplicationForm'

const AdoptionApplyPage = () => {
  const detail = MOCK_ADOPTION_DETAIL

  return <ApplicationForm detail={detail} />
}

export default AdoptionApplyPage
