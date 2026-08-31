'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import type { ContestEntry } from '@/shared/types'
import { ProfileAvatar } from '@/shared/ui'
import { ContestEntryImage } from './ContestEntryImage'
import { ContestVoteButton } from './ContestVoteButton'

type ContestVoteCardType = 'large' | 'md' | 'md-avatar'
type ContestVoteCardStatus = 'default' | 'hover' | 'press'

interface ContestVoteCardBaseProps {
  entry: ContestEntry
  /** 컬럼 폭을 채우고 md → large 비율로 PC에서 전환한다. 카드 목록의 반응형 렌더링용. */
  responsive?: boolean
  showProfile?: boolean
  showVoteButton?: boolean
  hasContestVote?: boolean
  isVoting?: boolean
  isVoteDisabled?: boolean
  onVote?: () => void
  onCancelVote?: () => void
  onImageClick?: () => void
  className?: string
}

type ContestVoteCardProps = ContestVoteCardBaseProps &
  (
    | { type?: 'large'; status?: 'default' | 'hover' }
    | { type: 'md'; status?: 'default' | 'hover' }
    | { type: 'md-avatar'; status?: 'default' | 'press' }
  )

const ContestVoteCard = ({
  entry,
  type = 'large',
  status = 'default',
  responsive = false,
  showProfile = type !== 'md',
  showVoteButton = type !== 'md-avatar',
  hasContestVote = false,
  isVoting = false,
  isVoteDisabled = false,
  onVote,
  onCancelVote,
  onImageClick,
  className,
}: ContestVoteCardProps) => {
  const isLarge = type === 'large'
  const isMd = type === 'md'
  const isMdAvatar = type === 'md-avatar'
  const canShowDetail = !isMdAvatar
  const showDetailOverlay = status === 'hover' && canShowDetail
  const showPressedStyle = status === 'press' && isMdAvatar

  return (
    <article
      className={cn(
        'group/card min-w-0 overflow-hidden bg-base-white transition-shadow',
        isMdAvatar
          ? 'flex h-[7.875rem] w-[20.9375rem] items-center gap-4 rounded-lg bg-neutral-50 p-2 active:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]'
          : 'flex flex-col',
        isLarge && 'w-[17.614rem] rounded-lg hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        isMd && 'w-[10.25rem] rounded-sm hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        isMd &&
          responsive &&
          'w-full pc:rounded-lg pc:hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        (showDetailOverlay || showPressedStyle) && 'shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={onImageClick}
        className={cn(
          'group/image relative shrink-0 overflow-hidden bg-neutral-700',
          isLarge && 'aspect-[281.831/230] w-full rounded-lg',
          isMd && 'aspect-[164/133.839] w-full rounded-sm',
          isMd && responsive && 'pc:aspect-[281.831/230] pc:rounded-lg',
          isMdAvatar && 'size-[6.875rem] rounded-sm',
        )}
        aria-label={`${entry.userDisplayName} 참여작 자세히 보기`}
      >
        <ContestEntryImage
          src={entry.photoUrl}
          alt={entry.description}
          sizes={
            isMdAvatar
              ? '110px'
              : responsive
                ? '(min-width: 1440px) 282px, (min-width: 768px) 30vw, 50vw'
                : isLarge
                  ? '282px'
                  : '164px'
          }
        />

        {canShowDetail && (
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-neutral-0/60 opacity-0 transition-opacity group-hover/image:opacity-100 group-focus-visible/image:opacity-100',
              showDetailOverlay && 'opacity-100',
            )}
          >
            <span
              className={cn(
                'flex h-8 items-center justify-center rounded-full border border-base-white px-4 text-xs font-semibold text-base-white',
                isLarge && 'h-10 px-7 text-sm',
                isMd && responsive && 'pc:h-10 pc:px-7 pc:text-sm',
              )}
            >
              자세히보기
            </span>
          </span>
        )}
      </button>

      <div
        className={cn(
          'min-w-0',
          isMdAvatar
            ? 'flex h-full flex-1 flex-col justify-between'
            : 'flex w-full flex-col bg-base-white',
          isLarge && 'gap-3 p-3',
          isMd && 'gap-0.5 p-2',
          isMd && responsive && 'pc:gap-3 pc:p-3',
        )}
      >
        <p
          className={cn(
            'min-w-0 overflow-hidden font-semibold break-words text-ellipsis text-neutral-700',
            isLarge && 'line-clamp-2 h-[2.604rem] text-sm leading-[1.5]',
            isMd && 'line-clamp-2 h-[2.604rem] text-xs leading-[1.5]',
            isMd && responsive && 'pc:text-sm',
            isMdAvatar && 'line-clamp-4 flex-1 text-xs leading-[1.5]',
          )}
        >
          {entry.description}
        </p>

        {showProfile && (
          <div className="flex h-8 min-w-0 items-center justify-between gap-2">
            <Link
              href={`/home/${entry.userId}`}
              className="flex min-w-0 items-center gap-2 text-sm font-semibold text-neutral-850"
            >
              <ProfileAvatar
                src={entry.userProfileImageUrl ?? undefined}
                alt={entry.userDisplayName}
                size="small"
              />
              <span className="truncate">{entry.userDisplayName}</span>
            </Link>

            {!isMdAvatar && (
              <Link
                href={`/home/${entry.userId}`}
                className="flex shrink-0 items-center pl-1 text-sm font-semibold text-neutral-850"
              >
                브리더홈
                <ArrowRightIcon className="size-5" />
              </Link>
            )}
          </div>
        )}

        {showVoteButton && (
          <ContestVoteButton
            isVoted={entry.hasVoted}
            hasContestVote={hasContestVote}
            onVote={onVote}
            onCancelVote={onCancelVote}
            isPending={isVoting}
            isDisabled={isVoteDisabled}
            className="w-full"
          />
        )}
      </div>
    </article>
  )
}

export { ContestVoteCard }
export type { ContestVoteCardProps, ContestVoteCardStatus, ContestVoteCardType }
