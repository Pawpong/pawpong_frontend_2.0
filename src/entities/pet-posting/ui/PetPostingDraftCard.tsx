import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, PawPrintIcon } from '@/shared/assets'
import { TEXT } from '@/shared/config'
import { formatDate } from '@/shared/lib/formatDate'
import { Badge, OwnerActionsMenu } from '@/shared/ui'
import type { PetPostingDraftCard as PetPostingDraft } from '@/shared/types'

interface PetPostingDraftCardProps {
  draft: PetPostingDraft
  onDelete: () => void
}

/** 작성 중인 분양글의 요약과 이어쓰기·삭제 동작을 제공하는 목록 카드. */
const PetPostingDraftCard = ({ draft, onDelete }: PetPostingDraftCardProps) => {
  const name = draft.name || '이름을 입력해 주세요'
  const breed = draft.breed || '품종 미입력'
  const editHref = `/adoption/create?draftId=${draft.draftId}`

  return (
    <article className="group relative flex min-w-0 items-center gap-3 px-3 py-4 tab:gap-5 tab:px-5 tab:py-5">
      <Link
        href={editHref}
        aria-label={`${name} 임시저장 글 이어서 작성`}
        className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      />

      <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-point-50 tab:size-24">
        {draft.primaryPhotoUrl ? (
          <Image
            src={draft.primaryPhotoUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 96px, 72px"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex size-full items-center justify-center" aria-hidden>
            <PawPrintIcon className="size-7 text-primary-300 tab:size-8" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <Badge variant="primarySoft" className="shrink-0">
            작성 중
          </Badge>
          <span className="truncate text-xs font-medium text-neutral-500">
            {formatDate(draft.updatedAt)} 저장
          </span>
        </div>
        <h2 className={`${TEXT.body} truncate`}>{name}</h2>
        <p className={`${TEXT.meta} mt-0.5 truncate`}>{breed}</p>
        <span className="mt-2 hidden items-center gap-1 text-sm font-semibold text-primary-600 tab:flex">
          이어서 작성
          <ArrowRightIcon className="size-4" />
        </span>
      </div>

      <div className="relative z-10 shrink-0 self-start pt-1">
        <OwnerActionsMenu
          onDelete={onDelete}
          ariaLabel={`${name} 임시저장 글 더보기`}
          className="rounded-full text-neutral-700 transition-colors hover:bg-primary-50"
        />
      </div>
    </article>
  )
}

export { PetPostingDraftCard }
