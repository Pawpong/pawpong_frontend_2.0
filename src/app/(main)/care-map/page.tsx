import { createPageMetadata } from '@/shared/lib/metadata'

import { CareMapContent } from '@/features/care-map'

export const metadata = createPageMetadata({
  title: '우리 동네 돌봄 지도',
  description:
    '가까운 동물병원과 보호·입양시설을 찾아보세요. 시설 정보부터 전화, 길찾기까지 함께해요.',
  path: '/care-map',
})

export default async function CareMapPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const { kind } = await searchParams
  const initialKind = kind === 'shelter' ? 'shelter' : 'hospital'
  return <CareMapContent key={initialKind} initialKind={initialKind} />
}
