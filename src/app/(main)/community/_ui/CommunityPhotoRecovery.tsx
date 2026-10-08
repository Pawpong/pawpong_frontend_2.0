'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/shared/ui'

export function CommunityPhotoRecovery({ source }: { source: 'ai-photo' | 'memory-card' }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  const card = source === 'memory-card'
  return (
    <section
      aria-labelledby="photo-recovery-heading"
      className="rounded-xl border border-primary-200 bg-point-50 p-5"
    >
      <h2 id="photo-recovery-heading" className="text-sm font-bold text-primary-700">
        사진을 다시 선택해 주세요
      </h2>
      <p role="status" className="mt-2 text-sm leading-relaxed text-neutral-700">
        화면을 새로 열었거나 안전한 전달 시간이 지나 사진이 연결되지 않았어요.{' '}
        {card
          ? '추억 카드를 다시 만들거나 기기에 저장한 카드 사진을 올려 주세요.'
          : 'AI 보관함에서 다시 고르거나 새 사진을 직접 올릴 수 있어요.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={card ? '/playground/memory-card' : '/home?tab=ai-photos'}
          className={buttonVariants({ intent: 'secondary', size: 'md' })}
        >
          {card ? '추억 카드 다시 만들기' : 'AI 보관함에서 고르기'}
        </Link>
        <Button intent="ghost" size="md" onClick={() => setDismissed(true)}>
          사진 없이 계속 쓰기
        </Button>
      </div>
    </section>
  )
}
