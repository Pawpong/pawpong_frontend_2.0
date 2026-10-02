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
          className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-sticky flex size-18 flex-col items-center justify-center gap-1 rounded-full border border-primary-100 bg-action-primary text-primary-700 shadow-[0_4px_12px_rgba(55,55,55,0.12)] focus-ring transition-colors hover:bg-action-primary-hover active:bg-action-primary-press motion-reduce:transition-none tab:hidden"
        >
          <PawPrintIcon aria-hidden className="size-6" />
          <span className="text-xs leading-[1.5] font-semibold">AI 문의하기</span>
        </button>
      }
    />
  )
}

/** 모바일 설정의 문의 진입점. 넓은 화면으로 바꾸면 포털로 열린 시트도 함께 닫는다. */
const MobileSupportInquiry = (props: MobileSupportInquiryProps) => {
  const isTablet = useBreakpoint('tab')

  if (isTablet) return null

  return <SupportInquiryLauncher {...props} />
}

export { MobileSupportInquiry }
