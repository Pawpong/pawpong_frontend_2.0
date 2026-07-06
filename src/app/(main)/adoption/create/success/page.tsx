import { AdoptionCreateSuccessContent } from './_ui/AdoptionCreateSuccessContent'

interface AdoptionCreateSuccessPageProps {
  searchParams: Promise<{ petId?: string }>
}

const AdoptionCreateSuccessPage = async ({ searchParams }: AdoptionCreateSuccessPageProps) => {
  const { petId } = await searchParams
  return <AdoptionCreateSuccessContent petId={petId} />
}

export default AdoptionCreateSuccessPage
