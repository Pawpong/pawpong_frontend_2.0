import type { Metadata } from 'next'
import { CareMapContent } from '@/features/care-map'

export const metadata: Metadata = {
  title: '우리 동네 돌봄 지도 | 포퐁',
  description:
    '카카오맵으로 가까운 동물병원과 보호·입양시설을 찾아보세요. 시설 정보 확인부터 전화, 길찾기까지 포퐁에서 함께해요.',
  alternates: { canonical: '/care-map' },
}

export default async function CareMapPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const { kind } = await searchParams
  const initialKind = kind === 'shelter' ? 'shelter' : 'hospital'
  return <CareMapContent key={initialKind} initialKind={initialKind} />
}
