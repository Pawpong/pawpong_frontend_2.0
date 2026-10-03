'use client'

import { useState } from 'react'
import { PawPrintIcon } from '@/shared/assets'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { SupportInquiryModal } from './SupportInquiryModal'

interface MobileSupportInquiryProps {
  audience: 'adopter' | 'breeder'
}

const SupportInquiryLauncher = ({ audience }: MobileSupportInquiryProps) => {
  const [open, setOpen] = useState(false)

  return (
    <SupportInquiryModal
      audience={audience}
      open={open}
      onOpenChange={setOpen}
      presentation="sheet"
      trigger={
        <button
          type="button"
          aria-label="AI 문의하기"
          className="fixed right-4 bottom-[calc(8rem+env(safe-area-inset-bottom))] z-10 flex size-18 flex-col items-center justify-center gap-1 rounded-full border border-primary-100 bg-action-primary text-primary-700 shadow-[0_4px_12px_rgba(55,55,55,0.12)] focus-ring transition-colors hover:bg-action-primary-hover active:bg-action-primary-press motion-reduce:transition-none tab:right-12 pc:hidden"
        >
          <PawPrintIcon aria-hidden className="size-6" />
          <span className="text-xs leading-[1.5] font-semibold">AI 문의하기</span>
        </button>
      }
    />
  )
}

/** 전체 메뉴 안에서만 표시한다. 메뉴가 데스크톱 드롭다운이 되면 상담 시트도 닫는다. */
const MobileSupportInquiry = (props: MobileSupportInquiryProps) => {
  const isDesktop = useBreakpoint('pc')

  if (isDesktop) return null

  return <SupportInquiryLauncher {...props} />
}

export { MobileSupportInquiry }
