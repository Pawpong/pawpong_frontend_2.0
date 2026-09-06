'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { ArrowRightIcon } from '@/shared/assets'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import { formatDate } from '@/shared/lib/formatDate'
import {
  Avatar,
  AvatarFallback,
  Button,
  Container,
  InfiniteScrollTrigger,
  ListState,
} from '@/shared/ui'
import type { ReceivedApplicationItemDto } from '@/shared/types'
import { ApplicationStatusBadge } from './ActivityBadges'

const ReceivedApplicationRow = ({ application }: { application: ReceivedApplicationItemDto }) => (
  <Link
    href={`/activity/applications/${application.applicationId}`}
    className="group flex min-h-28 items-center gap-3 px-4 py-4 transition-colors hover:bg-primary-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 tab:min-h-32 tab:gap-4 tab:px-5 tab:py-5"
  >
    <Avatar size="md" className="size-12 bg-neutral-100 tab:size-14">
      <AvatarFallback />
    </Avatar>

    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex flex-wrap items-center gap-2">
        <span className="truncate text-sm font-semibold text-neutral-850 tab:text-base">
          {application.adopterName || application.adopterNickname}
        </span>
        <ApplicationStatusBadge status={application.status} />
      </span>
      <span className="truncate text-xs font-medium text-neutral-700 tab:text-sm">
        {application.petName || '입양 상담 신청'}
      </span>
      <span className="text-xs font-medium text-neutral-500">
        신청일 {formatDate(application.appliedAt)}
      </span>
    </span>

    <ArrowRightIcon className="size-5 shrink-0 text-neutral-500 transition-colors group-hover:text-primary-500" />
  </Link>
)

const ReceivedApplicationList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteQuery(breederQueries.receivedApplications(20))
  const applications = useMemo(
    () => dedupeBy(flattenPages(data), (application) => application.applicationId),
    [data],
  )

  return (
    <Container className="px-4 py-5 tab:py-8 pc:py-10">
      <div className="mx-auto w-full max-w-168 pc:max-w-[59.25rem]">
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={applications.length === 0}
          loadingText="받은 신청을 불러오는 중입니다."
          errorText="받은 신청을 불러오지 못했습니다."
          emptyText="아직 받은 입양 신청이 없습니다."
          errorAction={
            <Button variant="fill" size="sm" className="px-4" onClick={() => void refetch()}>
              다시 시도
            </Button>
          }
        >
          <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
            <h2 className="px-4 pt-4 pb-2 font-cafe24 text-sm text-primary-600 tab:px-5 tab:text-base">
              받은 신청
            </h2>
            <div className="divide-y divide-neutral-150">
              {applications.map((application) => (
                <ReceivedApplicationRow key={application.applicationId} application={application} />
              ))}
            </div>
          </section>
        </ListState>

        <InfiniteScrollTrigger
          onIntersect={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </Container>
  )
}

export { ReceivedApplicationList }
