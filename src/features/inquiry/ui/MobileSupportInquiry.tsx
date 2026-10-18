'use client'

import { useState } from 'react'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { SupportInquiryModal } from './SupportInquiryModal'
import { SupportInquiryTrigger } from './SupportInquiryTrigger'

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
      trigger={<SupportInquiryTrigger />}
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
