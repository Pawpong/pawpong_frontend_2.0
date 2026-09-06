'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { formatDate } from '@/shared/lib/formatDate'
import {
  AsyncState,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Container,
  NavigationBar,
  buttonVariants,
} from '@/shared/ui'
import { ReviewTypeBadge } from '../../../_ui/ActivityBadges'

const ReviewDetailContent = ({ reviewId }: { reviewId: string }) => {
  const { data, isPending, isError, refetch } = useQuery(adopterQueries.reviewDetail(reviewId))

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar title="후기 상세" backHref="/activity?tab=reviews" />

      <Container className="px-4 py-5 tab:py-8 pc:py-10">
        <div className="mx-auto flex w-full max-w-168 flex-col gap-5 pc:max-w-[59.25rem]">
          {isPending && <AsyncState status="loading" message="후기를 불러오는 중입니다." />}
          {isError && !data && (
            <AsyncState
              status="error"
              message="후기를 불러오지 못했습니다."
              action={
                <Button variant="fill" size="sm" className="px-4" onClick={() => void refetch()}>
                  다시 시도
                </Button>
              }
            />
          )}

          {data && (
            <>
              <article className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
                <header className="flex items-start gap-3 border-b border-neutral-150 px-4 py-4 tab:gap-4 tab:px-6 tab:py-5">
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
                      <h1 className="truncate font-cafe24 text-lg text-neutral-850 tab:text-xl">
                        {data.breederNickname || '알 수 없는 브리더'}
                      </h1>
                      <ReviewTypeBadge reviewType={data.reviewType} />
                      <Badge
                        variant={data.isVisible ? 'primaryOutline' : 'neutralFilled'}
                        size="md"
                      >
                        {data.isVisible ? '공개 중' : '비공개'}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-neutral-500">
                      {formatDate(data.writtenAt)}
                      {data.breedingPetType &&
                        ` · ${data.breedingPetType === 'cat' ? '고양이' : '강아지'} 브리더`}
                    </p>
                  </div>
                </header>

                <div className="min-h-48 px-4 py-5 tab:min-h-56 tab:px-6 tab:py-6">
                  <p className="text-sm leading-[1.8] font-medium whitespace-pre-wrap text-neutral-850 tab:text-base">
                    {data.content}
                  </p>
                </div>
              </article>

              <section className="flex flex-col gap-3 rounded-xl border border-neutral-150 bg-white p-4 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:flex-row tab:justify-end tab:p-6">
                {data.breederId && (
                  <Link
                    href={`/home/${data.breederId}`}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'lg',
                      className: 'w-full px-6 tab:w-auto',
                    })}
                  >
                    브리더 홈
                  </Link>
                )}
                {data.applicationId && (
                  <Link
                    href={`/activity/applications/${data.applicationId}`}
                    className={buttonVariants({
                      variant: 'primary',
                      size: 'lg',
                      className: 'w-full px-6 tab:w-auto',
                    })}
                  >
                    신청 내역 보기
                  </Link>
                )}
              </section>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

export { ReviewDetailContent }
