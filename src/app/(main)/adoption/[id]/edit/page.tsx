'use client'

import { useParams } from 'next/navigation'
import { AdoptionEditContent } from './_ui/AdoptionEditContent'

const AdoptionEditPage = () => {
  const params = useParams<{ id: string }>()

  return <AdoptionEditContent petId={params.id} />
}

export default AdoptionEditPage
