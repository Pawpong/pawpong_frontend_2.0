'use client'

import Image from 'next/image'
import { ArrowRightIcon, VoteIcon } from '@/shared/assets/icons'
import {
  Dialog,
  DialogPortal,
  DialogTitle,
} from '@/shared/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ContestEntry } from '@/shared/types'

interface EntryDetailModalProps {
  entry: ContestEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** 상단 헤더 (닫기 + 투표 상태) */
const EntryHeader = ({
  entry,
  onClose,
  className,
}: {
  entry: ContestEntry
  onClose: () => void
  className?: string
}) => (
  <div className={`flex shrink-0 items-center ${className ?? ''}`}>
    <button
      type="button"
      className="flex w-[3.625rem] items-center justify-center rounded-full border border-[#d4d4d4] p-[0.625rem] tab:w-[5.75rem]"
      onClick={onClose}
    >
      <span className="text-sm font-medium text-white">닫기</span>
    </button>
    {entry.isVoted && (
      <div className="ml-auto flex items-center gap-1.5 tab:ml-0 tab:gap-2">
        <span className="text-sm font-medium text-white tab:text-base">투표했습니다</span>
        <VoteIcon className="size-6 text-white" />
        <span className="text-sm font-semibold leading-[1.375rem] text-white">
          {entry.voteCount}
        </span>
      </div>
    )}
  </div>
)

/** 이미지 + 참여자 정보 */
const EntryImage = ({ entry, className }: { entry: ContestEntry; className?: string }) => (
  <div className={`relative flex flex-col items-center justify-center ${className ?? ''}`}>
    <div className="w-[20.9375rem] overflow-hidden rounded-[1.1rem] bg-[#c6c6c6] tab:w-full tab:max-w-[27.875rem]">
      <Image
        src={entry.imageUrl}
        alt={entry.description}
        width={446}
        height={450}
        className="aspect-square size-full object-cover"
      />
    </div>
    <div className="absolute bottom-4 right-5 flex flex-col items-end tab:right-6">
      <span className="text-base font-semibold text-white tab:text-xl">
        {entry.participant.name}
      </span>
      <button
        type="button"
        className="flex items-center text-base font-semibold text-white tab:text-xl"
      >
        홈으로
        <ArrowRightIcon className="size-6 text-white" />
      </button>
    </div>
  </div>
)

/** 하단 설명 */
const EntryDescription = ({ entry }: { entry: ContestEntry }) => (
  <div className="shrink-0 bg-[#2f2f2f] px-5 py-3 tab:px-16 tab:py-8">
    <p className="text-sm font-medium leading-relaxed text-white">
      {entry.description}
    </p>
  </div>
)

const EntryDetailModal = ({ entry, open, onOpenChange }: EntryDetailModalProps) => {
  if (!entry) return null

  const handleClose = () => onOpenChange(false)

  return (
    <>
      {/* 모바일: 풀스크린 오버레이 (Dialog 없이) */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[3rem] z-40 flex flex-col bg-[#121212] tab:hidden">
          <EntryHeader
            entry={entry}
            onClose={handleClose}
            className="h-[3.3125rem] px-[1.125rem]"
          />
          <EntryImage entry={entry} className="flex-1" />
          <EntryDescription entry={entry} />
        </div>
      )}

      {/* PC: Dialog 모달 */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 hidden bg-black/50 tab:block" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 hidden max-w-[57.25rem] w-[calc(100%-2.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#c6c6c6] bg-black tab:block">
            <DialogTitle className="sr-only">콘테스트 엔트리 상세</DialogTitle>
            <EntryHeader
              entry={entry}
              onClose={handleClose}
              className="h-[4.4375rem] gap-3 px-10"
            />
            <EntryImage entry={entry} />
            <EntryDescription entry={entry} />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  )
}

export { EntryDetailModal }
