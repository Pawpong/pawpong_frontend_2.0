'use client'

import { useQuery } from '@tanstack/react-query'
import { noticeQueries } from '@/entities/notice'
import { formatDate } from '@/shared/lib/formatDate'
import { AsyncState, Badge, Button, Container, NavigationBar } from '@/shared/ui'

/** 공지사항 상세. GET /api/v2/notice/{noticeId} */
const NoticeDetailContent = ({ noticeId }: { noticeId: string }) => {
  const { data, isPending, isError, refetch } = useQuery(noticeQueries.detail(noticeId))

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar title="공지사항" backHref="/notices" />

      <Container className="px-4 py-5 tab:py-8 pc:py-10">
        <div className="mx-auto flex w-full max-w-168 flex-col gap-5 pc:max-w-[59.25rem]">
          {isPending && <AsyncState status="loading" message="공지사항을 불러오는 중입니다." />}
          {isError && !data && (
            <AsyncState
              status="error"
              message="공지사항을 불러오지 못했습니다."
              action={
                <Button variant="fill" size="sm" className="px-4" onClick={() => void refetch()}>
                  다시 시도
                </Button>
              }
            />
          )}

          {data && (
            <section className="rounded-xl border border-neutral-150 bg-white p-4 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {data.isPinned && (
                    <Badge variant="primaryFilled" size="md">
                      고정
                    </Badge>
                  )}
                  <h1 className="truncate font-cafe24 text-lg text-neutral-850 tab:text-xl">
                    {data.title}
                  </h1>
                </div>
                <p className="text-xs font-medium text-neutral-500">
                  {formatDate(data.publishedAt ?? data.createdAt)} · {data.authorName}
                </p>
              </div>

              <p className="mt-4 border-t border-neutral-150 pt-4 text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-850 tab:text-base">
                {data.content}
              </p>
            </section>
          )}
        </div>
      </Container>
    </div>
  )
}

export { NoticeDetailContent }
