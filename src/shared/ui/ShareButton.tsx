'use client'

import { useState } from 'react'
import { ShareIcon } from '@/shared/assets'
import { Button } from './Button'
import { ShareModal } from './ShareModal'
import { ToggleIconButton } from './ToggleIconButton'

export interface ShareButtonProps {
  url: string
  title: string
  description?: string
  imageUrl?: string
  ariaLabel?: string
  /**
   * icon: 공유 아이콘 (기본)
   * button: 글자 버튼 — 다른 버튼과 나란히 둘 때 (마이홈 '내 홈 공유'). 같은 secondary 모양으로 폭을 채운다
   */
  trigger?: 'icon' | 'button'
  /** trigger="button" 의 글자 */
  label?: string
}

/** 페이지와 모달 모두 명시적인 콘텐츠 URL을 공유한다. */
const ShareButton = ({
  ariaLabel = '공유하기',
  trigger = 'icon',
  label = '공유하기',
  ...content
}: ShareButtonProps) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      {trigger === 'button' ? (
        <Button intent="secondary" size="md" width="full" onClick={() => setOpen(true)}>
          {label}
        </Button>
      ) : (
        <ToggleIconButton
          icon={ShareIcon}
          size="sm"
          aria-label={ariaLabel}
          onClick={() => setOpen(true)}
        />
      )}
      <ShareModal open={open} onOpenChange={setOpen} {...content} />
    </>
  )
}

export { ShareButton }
