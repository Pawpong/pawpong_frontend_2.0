'use client'

import type { ReportBreederPayload } from '@/shared/types'
import { ReportAction } from '@/shared/ui'
import { useReportBreeder } from '../api/report.mutations'

const BREEDER_REPORT_OPTIONS = [
  { value: 'no_contract', label: '계약서 미작성' },
  { value: 'false_info', label: '허위 정보 제공' },
  { value: 'inappropriate_content', label: '부적절한 콘텐츠' },
  { value: 'poor_conditions', label: '열악한 사육 환경' },
  { value: 'fraud', label: '사기 의심' },
  { value: 'other', label: '기타' },
] satisfies { value: ReportBreederPayload['reason']; label: string }[]

export const ReportBreederAction = ({
  breederId,
  triggerVariant = 'flag',
}: {
  breederId: string
  /** flag: 깃발 아이콘, menu: ⋯ 메뉴 안의 '신고' (브리더 홈 상단) */
  triggerVariant?: 'flag' | 'menu'
}) => {
  const reportBreeder = useReportBreeder()
  return (
    <ReportAction
      triggerVariant={triggerVariant}
      // ⋯ 메뉴는 브리더 홈 상단에서 갈색 공유 아이콘 옆에 붙는다
      menuTone="brand"
      targetLabel="브리더"
      options={BREEDER_REPORT_OPTIONS}
      requireOtherDescription
      onSubmit={async (data) => {
        await reportBreeder.mutateAsync({ breederId, ...data })
        return '신고를 접수했어요. 운영팀이 내용을 검토할 예정이에요.'
      }}
    />
  )
}
