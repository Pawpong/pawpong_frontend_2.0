'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { ActivityDetailFlow, ActivitySummary } from '../../../_ui/ActivityDetailFlow'
import { TEXT } from '@/shared/config'
import { ActivityDetailLayout } from '../../../_ui/ActivityDetailLayout'
import { formatDate } from '@/shared/lib/formatDate'
import { Avatar, AvatarFallback, AvatarImage, Badge, buttonVariants } from '@/shared/ui'
import { ReviewTypeBadge } from '../../../_ui/ActivityBadges'

const ReviewDetailContent = ({ reviewId, backHref }: { reviewId: string; backHref: string }) => {
  const { data, isPending, isError, refetch } = useQuery(adopterQueries.reviewDetail(reviewId))

  return (
    <ActivityDetailLayout
      title="후기 상세"
      backHref={backHref}
      isPending={isPending}
      isError={isError}
      hasData={!!data}
      onRetry={() => void refetch()}
    >
      {data && (
        <>
          <ActivityDetailFlow
            summary={
              <ActivitySummary
                label="후기를 보낸 브리더"
                name={data.breederNickname || '알 수 없는 브리더'}
                actions={
                  <section aria-label="후기 관련 페이지" className="flex flex-col gap-3">
                    {data.breederId && (
                      <Link
                        href={`/home/${data.breederId}`}
                        className={buttonVariants({
                          variant: 'outline',
                          size: 'lg',
                          className: 'w-full px-6',
                        })}
                      >
                        브리더 홈
                      </Link>
                    )}
                    {data.applicationId && (
                      <Link
                        href={`/activity/applications/${data.applicationId}?view=sent`}
                        className={buttonVariants({
                          variant: 'primary',
                          size: 'lg',
                          className: 'w-full px-6',
                        })}
                      >
                        신청 내역 보기
                      </Link>
                    )}
                  </section>
                }
              >
                <div className="flex items-start gap-3">
                  <Avatar size="md" className="size-12 bg-neutral-100 tab:size-14">
                    {data.breederProfileImage && (
                      <AvatarImage
                        src={data.breederProfileImage}
                        alt={`${data.breederNickname || '브리더'} 프로필`}
                      />
                    )}
                    <AvatarFallback />
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <ReviewTypeBadge reviewType={data.reviewType} />
                      <Badge
                        variant={data.isVisible ? 'primaryOutline' : 'neutralFilled'}
                        size="md"
                      >
                        {data.isVisible ? '공개 중' : '비공개'}
                      </Badge>
                    </div>
                    <p className={TEXT.meta}>
                      {formatDate(data.writtenAt)}
                      {data.breedingPetType &&
                        ` · ${data.breedingPetType === 'cat' ? '고양이' : '강아지'} 브리더`}
                    </p>
                  </div>
                </div>
              </ActivitySummary>
            }
          >
            <article className="min-w-0">
              <header className="border-b border-neutral-150 pb-6">
                <p className={TEXT.meta}>내가 남긴 이야기</p>
                <h1 className={`${TEXT.display} mt-2`}>
                  {data.reviewType === 'adoption' ? '입양 후기' : '상담 후기'}
                </h1>
              </header>

              <div className="py-8 tab:py-10">
                <p className={`${TEXT.prose} text-neutral-850`}>{data.content}</p>
              </div>
            </article>
          </ActivityDetailFlow>
        </>
      )}
    </ActivityDetailLayout>
  )
}

export { ReviewDetailContent }
