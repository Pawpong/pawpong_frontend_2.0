'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AdoptionStatusBadge } from '@/entities/adoption'
import { PawPrintIcon, PixelPencilIcon } from '@/shared/assets'
import { TEXT } from '@/shared/config'
import { iconButtonVariants } from '@/shared/ui'
import type { MyPetPostingCard as Posting } from '@/shared/types'
import { formatBirthDate } from '@/shared/lib/formatBirthDate'

const formatCount = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('ko-KR') : '—'

/** 상세·후기 화면과 같은 제목 서체와 괘선으로 구성한 내 분양글. */
export const MyPetPostingCard = ({ posting }: { posting: Posting }) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string>()
  const age =
    posting.ageDescription || (posting.birthDate ? formatBirthDate(posting.birthDate) : '')
  const detailHref = `/adoption/${posting.petId}`
  const showImage = posting.primaryPhotoUrl && failedImageUrl !== posting.primaryPhotoUrl

  return (
    <article className="flex min-w-0 flex-col gap-4 border-b border-neutral-150 py-6 tab:gap-5 tab:py-8">
      <div className="flex items-start gap-4 tab:gap-6">
        <Link
          href={detailHref}
          aria-label={`${posting.name} 상세 보기`}
          className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-lg bg-point-50 focus-ring tab:w-40"
        >
          {showImage ? (
            <Image
              src={posting.primaryPhotoUrl}
              alt={posting.name}
              fill
              sizes="(max-width: 767px) 112px, 160px"
              className="object-cover"
              onError={() => setFailedImageUrl(posting.primaryPhotoUrl)}
            />
          ) : (
            <span className="flex size-full items-center justify-center text-primary-300">
              <PawPrintIcon className="size-10" />
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <AdoptionStatusBadge status={posting.status} />
              <span className={TEXT.meta}>{posting.breed || '품종 미등록'}</span>
            </div>
            {/* 수정 진입 — 모바일·태블릿 공통 아이콘 하나 (터치 영역 40px, 아이콘은 오른쪽 가장자리에 맞춤) */}
            <Link
              href={`/adoption/${posting.petId}/edit`}
              aria-label={`${posting.name} 분양글 수정`}
              title="수정하기"
              className={iconButtonVariants({ edge: 'end' })}
            >
              <PixelPencilIcon className="size-6" />
            </Link>
          </div>
          <Link href={detailHref} className="max-w-full rounded focus-ring">
            <h3 className={`${TEXT.section} break-words`}>{posting.name}</h3>
          </Link>
          <p className={TEXT.sub}>
            {[posting.gender === 'male' ? '수컷' : posting.gender === 'female' ? '암컷' : null, age]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className={TEXT.meta}>분양가</span>
            <p className="font-cafe24 text-xl leading-[1.4] text-primary-500 tab:text-2xl">
              {typeof posting.price === 'number' && Number.isFinite(posting.price)
                ? `${posting.price.toLocaleString('ko-KR')}원`
                : '미등록'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 tab:pl-46">
        <dl className="flex flex-wrap gap-x-4 gap-y-2">
          {(
            [
              ['조회', posting.viewCount],
              ['관심', posting.favoriteCount],
              ['문의', posting.inquiryCount],
              ['채팅', posting.chatCount],
            ] as const
          ).map(([label, count]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt className={TEXT.meta}>{label}</dt>
              <dd className={TEXT.sub}>{formatCount(count)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
