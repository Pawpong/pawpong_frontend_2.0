'use client'

import {
  Dialog,
  DialogPortal,
  DialogTitle,
} from '@/shared/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ContestEntry, HomeUserType } from '@/shared/types'
import { EntryDetailView } from './EntryDetailView'

interface EntryDetailModalProps {
  entry: ContestEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userType: HomeUserType
}

const EntryDetailModal = ({ entry, open, onOpenChange, userType }: EntryDetailModalProps) => {
  if (!entry) return null

  const handleClose = () => onOpenChange(false)

  return (
    <>
      {/* 모바일: 풀스크린 오버레이 (Dialog 없이) */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[3rem] z-40 flex flex-col bg-[#121212] tab:hidden">
          <EntryDetailView
            entry={entry}
            userType={userType}
            onClose={handleClose}
            headerClassName="h-[3.3125rem] px-[1.125rem]"
            imageClassName="flex-1"
          />
        </div>
      )}

      {/* PC: Dialog 모달 */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 hidden bg-black/50 tab:block" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 hidden max-w-[57.25rem] w-[calc(100%-2.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#c6c6c6] bg-black tab:block">
            <DialogTitle className="sr-only">콘테스트 엔트리 상세</DialogTitle>
            <EntryDetailView
              entry={entry}
              userType={userType}
              onClose={handleClose}
              headerClassName="h-[4.4375rem] gap-3 px-10"
            />
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  )
}

export { EntryDetailModal }
