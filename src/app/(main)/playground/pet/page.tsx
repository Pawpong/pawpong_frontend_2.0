import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { isPetServerEnabled } from '@/features/playground-pet/lib/server'
import { PetPage } from '@/features/playground-pet/ui/PetPage'

export const metadata = {
  title: '내 반려동물 키우기 | 포퐁',
  description: '사진으로 나만의 도트 반려동물을 만들고 함께 성장해요.',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

export default async function PlaygroundPetPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceJobId?: string }>
}) {
  const host = (await headers()).get('host') ?? ''
  if (!(await isPetServerEnabled(host))) notFound()
  const { sourceJobId } = await searchParams
  return <PetPage initialSourceJobId={typeof sourceJobId === 'string' ? sourceJobId : undefined} />
}
