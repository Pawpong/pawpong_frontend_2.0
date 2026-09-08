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

export const ReportBreederAction = ({ breederId }: { breederId: string }) => {
  const reportBreeder = useReportBreeder()
  return (
    <ReportAction
      targetLabel="브리더"
      options={BREEDER_REPORT_OPTIONS}
      requireOtherDescription
      onSubmit={async (data) => {
        await reportBreeder.mutateAsync({ breederId, ...data })
        return '신고가 접수되었습니다. 운영팀이 내용을 검토할 예정입니다.'
      }}
    />
  )
}
