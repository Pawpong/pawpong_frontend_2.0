import type { ReactNode } from 'react'
import { PAGE_WIDTH_CLASS } from '@/shared/config'
import { AlertMessage, AsyncState, Button, Container, NavigationBar } from '@/shared/ui'

interface ActivityDetailLayoutProps {
  title: string
  backHref: string
  isPending: boolean
  isError: boolean
  hasData: boolean
  onRetry: () => void
  children: ReactNode
}

/** 목록과 같은 기준선을 쓰고 구분선으로 이어지는 활동 상세 문서. */
export const ActivityDetailLayout = ({
  title,
  backHref,
  isPending,
  isError,
  hasData,
  onRetry,
  children,
}: ActivityDetailLayoutProps) => (
  <div className="flex w-full flex-1 flex-col bg-white pb-16">
    <NavigationBar
      title={title}
      backHref={backHref}
      className={`${PAGE_WIDTH_CLASS} tab:max-w-[90rem]`}
    />
    <Container className={`${PAGE_WIDTH_CLASS} px-4 py-8 tab:max-w-[90rem] tab:py-10 pc:py-12`}>
      {isPending && !hasData && (
        <AsyncState status="loading" message="상세 내용을 불러오는 중입니다." />
      )}
      {isError && !hasData && (
        <AsyncState
          status="error"
          message="상세 내용을 불러오지 못했습니다."
          action={
            <Button variant="fill" size="sm" className="px-4" onClick={onRetry}>
              다시 시도
            </Button>
          }
        />
      )}
      {isError && hasData && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <AlertMessage status="error" message="최신 정보를 불러오지 못했어요." />
          <Button variant="outline" size="sm" className="px-4" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-8 [overflow-wrap:anywhere] tab:gap-10">
        {children}
      </div>
    </Container>
  </div>
)
