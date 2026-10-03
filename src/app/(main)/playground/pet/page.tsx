import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { isPetServerEnabled } from '@/features/playground-pet/lib/server'
import { PetPage } from '@/features/playground-pet/ui/PetPage'

export const metadata = { title: '내 도트 친구 | 포퐁', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function PlaygroundPetPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceJobId?: string }>
}) {
  const host = (await headers()).get('host') ?? ''
  if (!isPetServerEnabled(host)) notFound()
  const { sourceJobId } = await searchParams
  return <PetPage initialSourceJobId={typeof sourceJobId === 'string' ? sourceJobId : undefined} />
}
