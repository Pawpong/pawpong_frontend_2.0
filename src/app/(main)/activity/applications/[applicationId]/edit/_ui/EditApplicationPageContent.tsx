'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application'
import { AsyncState, Button, buttonVariants } from '@/shared/ui'
import { EditApplicationFormFields } from './EditApplicationForm'

const EditApplicationPageContent = ({ applicationId }: { applicationId: string }) => {
  const { data, isPending, isError, refetch } = useQuery(applicationQueries.detail(applicationId))

  if (isPending) {
    return (
      <AsyncState
        status="loading"
        message="신청서를 불러오는 중입니다."
        className="min-h-[24rem]"
      />
    )
  }

  if (isError || !data) {
    return (
      <AsyncState
        status="error"
        message="신청서를 불러오지 못했습니다."
        action={
          <Button variant="fill" size="sm" onClick={() => void refetch()}>
            다시 시도
          </Button>
        }
        className="min-h-[24rem]"
      />
    )
  }

  // 브리더가 상담을 시작한 뒤에는 백엔드도 거부하므로, 대기 상태가 아니면 폼 자체를 열지 않는다.
  if (data.status !== 'consultation_pending') {
    return (
      <AsyncState
        status="error"
        message="상담 대기 상태인 신청서만 수정할 수 있어요."
        action={
          <Link
            href={`/activity/applications/${applicationId}`}
            className={buttonVariants({ variant: 'fill', size: 'sm' })}
          >
            신청 상세로 돌아가기
          </Link>
        }
        className="min-h-[24rem]"
      />
    )
  }

  return <EditApplicationFormFields applicationId={applicationId} detail={data} />
}

export { EditApplicationPageContent }
