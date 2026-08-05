'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import Image from 'next/image'
import { CloseIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogOverlay, DialogPortal } from './Dialog'

/* 공유하기 모달 (Figma 1949-253368) — 인스타/카카오톡/페이스북/URL 복사 */

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 공유할 URL (기본: 현재 페이지) */
  url?: string
  className?: string
}

type ShareKey = 'instagram' | 'kakao' | 'facebook' | 'copy'

const OPTIONS: { key: ShareKey; label: string; icon: string; circle: string }[] = [
  {
    key: 'instagram',
    label: '인스타그램',
    icon: '/images/share/instagram.svg',
    circle: 'border border-neutral-150 bg-white',
  },
  { key: 'kakao', label: '카카오톡', icon: '/images/share/kakaotalk.svg', circle: 'bg-[#ffe812]' },
  { key: 'facebook', label: '페이스북', icon: '/images/share/facebook.png', circle: 'bg-[#0866ff]' },
  { key: 'copy', label: 'URL 복사', icon: '/images/share/link.svg', circle: 'bg-neutral-100' },
]

const ShareModal = ({ open, onOpenChange, url, className }: ShareModalProps) => {
  const share = (key: ShareKey) => {
    const shareUrl = url ?? window.location.href
    switch (key) {
      case 'copy':
        void navigator.clipboard.writeText(shareUrl)
        break
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer',
        )
        break
      // ponytail: 카카오톡은 Kakao SDK, 인스타는 웹 공유 인텐트가 없어 별도 연동 필요 — 연동 시 여기 처리
      case 'kakao':
      case 'instagram':
        break
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-[22.5rem] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[0.75rem] bg-white data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
            className,
          )}
        >
          {/* 헤더: X + 공유하기 */}
          <div className="flex flex-col items-center gap-2 p-3">
            <div className="flex h-6 w-full items-center justify-end">
              <DialogPrimitive.Close aria-label="닫기">
                <CloseIcon className="size-6 text-neutral-850" />
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Title className="text-xl leading-[1.5] font-semibold text-neutral-850">
              공유하기
            </DialogPrimitive.Title>
          </div>

          {/* 공유 옵션 행 (Figma 1945-136563) */}
          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6 px-3 py-5">
            {OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => share(option.key)}
                className="flex flex-col items-center gap-0.5"
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-full',
                    option.circle,
                  )}
                >
                  <Image
                    src={option.icon}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                  />
                </span>
                <span className="text-sm leading-[1.5] font-medium text-neutral-850">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { ShareModal }
