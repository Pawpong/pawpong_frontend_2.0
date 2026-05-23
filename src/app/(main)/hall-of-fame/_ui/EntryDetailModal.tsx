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

const EntryDetailModal = ({ entry, open, onOpenChange }: EntryDetailModalProps) => {
  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-x-0 bottom-0 top-[3rem] z-50 bg-black/50 tab:inset-0" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 top-[3rem] z-50 flex flex-col bg-[#121212] tab:inset-auto tab:left-1/2 tab:top-1/2 tab:w-[calc(100%-2.5rem)] tab:max-w-[57.25rem] tab:-translate-x-1/2 tab:-translate-y-1/2 tab:overflow-hidden tab:rounded-2xl tab:border tab:border-[#c6c6c6] tab:bg-black">
          <DialogTitle className="sr-only">콘테스트 엔트리 상세</DialogTitle>

          {/* 상단 헤더 */}
          <div className="flex h-[3.3125rem] shrink-0 items-center px-[1.125rem] tab:h-[4.4375rem] tab:gap-3 tab:px-10">
            <button
              type="button"
              className="flex w-[3.625rem] items-center justify-center rounded-full border border-[#d4d4d4] p-[0.625rem] tab:w-[5.75rem]"
              onClick={() => onOpenChange(false)}
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

          {/* 이미지 + 참여자 정보 */}
          <div className="relative flex flex-1 flex-col items-center justify-center tab:flex-none">
            <div className="w-[20.9375rem] overflow-hidden rounded-[1.1rem] bg-[#c6c6c6] tab:w-full tab:max-w-[27.875rem]">
              <Image
                src={entry.imageUrl}
                alt={entry.description}
                width={446}
                height={450}
                className="aspect-square size-full object-cover"
              />
            </div>

            {/* 참여자 이름 + 홈으로 */}
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

          {/* 하단 설명 */}
          <div className="shrink-0 bg-[#2f2f2f] px-5 py-3 tab:px-16 tab:py-8">
            <p className="text-sm font-medium leading-relaxed text-white">
              {entry.description}
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { EntryDetailModal }
