import { AdoptionCreateSuccessContent } from './_ui/AdoptionCreateSuccessContent'
import { redirect } from 'next/navigation'

interface AdoptionCreateSuccessPageProps {
  searchParams: Promise<{ petId?: string }>
}

const AdoptionCreateSuccessPage = async ({ searchParams }: AdoptionCreateSuccessPageProps) => {
  const { petId } = await searchParams
  if (!petId) redirect('/adoption/my-listings')
  return <AdoptionCreateSuccessContent petId={petId} />
}

export default AdoptionCreateSuccessPage
