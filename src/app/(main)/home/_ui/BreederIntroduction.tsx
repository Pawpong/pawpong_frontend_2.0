'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PixelArrowRightIcon } from '@/shared/assets'
import { Container } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface BreederIntroductionProps {
  nickname: string
  description?: string
  /** 마이홈에서만 — 수정 링크와 빈 상태 안내를 노출 */
  editHref?: string
}

// 픽셀 계단 모서리(2단, 4px·8px). 프레임/속/그림자 세 겹이 같은 실루엣을 공유한다
const PIXEL_CLIP =
  'polygon(0.5rem 0, calc(100% - 0.5rem) 0, calc(100% - 0.5rem) 0.25rem, calc(100% - 0.25rem) 0.25rem, calc(100% - 0.25rem) 0.5rem, 100% 0.5rem, 100% calc(100% - 0.5rem), calc(100% - 0.25rem) calc(100% - 0.5rem), calc(100% - 0.25rem) calc(100% - 0.25rem), calc(100% - 0.5rem) calc(100% - 0.25rem), calc(100% - 0.5rem) 100%, 0.5rem 100%, 0.5rem calc(100% - 0.25rem), 0.25rem calc(100% - 0.25rem), 0.25rem calc(100% - 0.5rem), 0 calc(100% - 0.5rem), 0 0.5rem, 0.25rem 0.5rem, 0.25rem 0.25rem, 0.5rem 0.25rem)'

const CLAMP_LINES = 4

/**
 * 브리더 소개 명패 — 분양 목록 탭 상단.
 * 껍데기(프레임·타이틀·화살표)만 픽셀, 본문은 Pretendard 로 가독성을 지킨다.
 * blur 없는 오프셋 그림자가 픽셀 인상의 대부분을 만든다.
 */
const BreederIntroduction = ({ nickname, description, editHref }: BreederIntroductionProps) => {
  const [expanded, setExpanded] = useState(false)
  const hasDescription = Boolean(description?.trim())

  // 공개 홈에서 소개가 없으면 섹션 자체를 그리지 않는다
  if (!hasDescription && !editHref) return null

  return (
    <Container className="pt-5">
      <section aria-label="브리더 소개" className="relative">
        {/* 그림자 층 */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-1 translate-y-1 bg-secondary-300"
          style={{ clipPath: PIXEL_CLIP }}
        />
        {/* 프레임 층 */}
        <div className="relative bg-secondary-500 p-0.5" style={{ clipPath: PIXEL_CLIP }}>
          {/* 속 */}
          <div className="bg-point-50 px-4 py-4 tab:px-5" style={{ clipPath: PIXEL_CLIP }}>
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-secondary-400 pb-3">
              <h2 className="min-w-0 truncate font-cafe24 text-base text-primary-700 tab:text-lg">
                {nickname}의 소개
              </h2>
              {editHref && (
                <Link
                  href={editHref}
                  className="shrink-0 rounded text-xs font-semibold text-primary-500 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  수정
                </Link>
              )}
            </div>

            {hasDescription ? (
              <>
                <p
                  className={cn(
                    'mt-3 text-sm leading-[1.6] whitespace-pre-wrap text-neutral-700',
                    !expanded && 'line-clamp-4',
                  )}
                >
                  {description}
                </p>
                {/* 줄 수를 세지 않고 문단 길이로 판단 — 짧은 소개엔 버튼이 안 뜬다 */}
                {(description?.split('\n').length ?? 0) > CLAMP_LINES ||
                (description?.length ?? 0) > 160 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    aria-expanded={expanded}
                    className="mt-2 flex items-center gap-1 rounded text-xs font-semibold text-primary-500 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                  >
                    {expanded ? '접기' : '더 보기'}
                    <PixelArrowRightIcon
                      className={cn('size-4 transition-transform', expanded && 'rotate-90')}
                    />
                  </button>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm leading-[1.6] text-neutral-500">
                아직 소개가 없어요. 입양자에게 브리더님을 소개해 주세요.
              </p>
            )}
          </div>
        </div>
      </section>
    </Container>
  )
}

export { BreederIntroduction }
