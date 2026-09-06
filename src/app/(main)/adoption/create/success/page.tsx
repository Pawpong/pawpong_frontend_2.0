import { AdoptionCreateSuccessContent } from './_ui/AdoptionCreateSuccessContent'
import { redirect } from 'next/navigation'

interface AdoptionCreateSuccessPageProps {
  searchParams: Promise<{ petId?: string }>
}

const AdoptionCreateSuccessPage = async ({ searchParams }: AdoptionCreateSuccessPageProps) => {
  const { petId } = await searchParams
  // /adoption/my-listings 는 마이홈 분양중 탭과 완전히 중복이라 삭제됨
  if (!petId) redirect('/home')
  return <AdoptionCreateSuccessContent petId={petId} />
}

export default AdoptionCreateSuccessPage
