'use client'

import { useState } from 'react'
import { ShareIcon } from '@/shared/assets'
import { ShareModal } from './ShareModal'
import { ToggleIconButton } from './ToggleIconButton'

export interface ShareButtonProps {
  url: string
  title: string
  description?: string
  imageUrl?: string
  ariaLabel?: string
}

/** 페이지와 모달 모두 명시적인 콘텐츠 URL을 공유한다. */
const ShareButton = ({ ariaLabel = '공유하기', ...content }: ShareButtonProps) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <ToggleIconButton
        icon={ShareIcon}
        size="md"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      />
      <ShareModal open={open} onOpenChange={setOpen} {...content} />
    </>
  )
}

export { ShareButton }
