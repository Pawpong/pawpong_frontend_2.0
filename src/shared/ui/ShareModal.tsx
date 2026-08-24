'use client'

import { useEffect, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import Image from 'next/image'
import { CloseIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { getKakao, shareToKakao } from '@/shared/lib/kakao'
import { Dialog, DialogOverlay, DialogPortal } from './Dialog'

/* 공유하기 모달 (Figma 1949-253368) — 카카오톡/페이스북/네이버 블로그/URL 복사.
   인스타그램은 웹 공유 인텐트를 제공하지 않아 URL 복사로만 폴백돼서 제외했다 */

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 공유할 URL (기본: 현재 페이지) */
  url?: string
  /** 카카오/OS 공유 시 제목 (기본: document.title) */
  title?: string
  /** 카카오 공유 설명 */
  description?: string
  /** 카카오 공유 썸네일 (절대 URL) */
  imageUrl?: string
  className?: string
}

type ShareKey = 'kakao' | 'facebook' | 'naver' | 'copy'

interface ShareFeedback {
  tone: 'success' | 'error'
  message: string
}

const OPTIONS: { key: ShareKey; label: string; icon: string; circle: string }[] = [
  { key: 'kakao', label: '카카오톡', icon: '/images/share/kakaotalk.svg', circle: 'bg-[#ffe812]' },
  {
    key: 'facebook',
    label: '페이스북',
    icon: '/images/share/facebook.png',
    circle: 'bg-[#0866ff]',
  },
  {
    key: 'naver',
    label: '블로그',
    icon: '/images/share/naver.svg',
    circle: 'bg-[#03c75a]',
  },
  { key: 'copy', label: 'URL 복사', icon: '/images/share/link.svg', circle: 'bg-neutral-100' },
]

/** 외부 공유 페이지를 팝업으로 연다. 차단되면 호출부에서 에러 피드백으로 이어진다. */
const openSharePopup = (shareUrl: string) => {
  const popup = window.open(shareUrl, '_blank', 'popup,width=720,height=640')
  if (!popup) throw new Error('팝업이 차단되었습니다.')
  popup.opener = null
}

/** Async Clipboard를 우선 사용하고, HTTP·구형 브라우저에서는 동기 복사로 폴백한다. */
const copyToClipboard = async (text: string) => {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    if (!document.execCommand('copy')) throw new Error('URL을 복사하지 못했습니다.')
  } finally {
    textarea.remove()
  }
}

const ShareModal = ({
  open,
  onOpenChange,
  url,
  title,
  description,
  imageUrl,
  className,
}: ShareModalProps) => {
  // [refactored] 4-state enum -> boolean (로드 완료 여부만 쓰인다)
  const [kakaoReady, setKakaoReady] = useState(false)
  const [feedback, setFeedback] = useState<ShareFeedback | null>(null)

  // 닫을 때 상태 리셋은 이벤트에서 한다. effect 안에서 동기로 setState 하면
  // 렌더가 한 번 더 도는 데다(react-hooks/set-state-in-effect) 닫히는 순간 필요도 없다.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setKakaoReady(false)
      setFeedback(null)
    }
    onOpenChange(next)
  }

  // 모달이 열린 동안 SDK를 미리 로드/init만 해둔다. 실제 공유는 클릭 시 동기로 호출.
  useEffect(() => {
    if (!open) return

    let cancelled = false
    void getKakao()
      .then(() => {
        if (!cancelled) setKakaoReady(true)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [open])

  const share = async (key: ShareKey) => {
    const shareUrl = new URL(url ?? window.location.href, window.location.href).href
    const shareTitle = title ?? document.title
    setFeedback(null)

    try {
      switch (key) {
        case 'copy': {
          await copyToClipboard(shareUrl)
          setFeedback({ tone: 'success', message: 'URL을 복사했습니다.' })
          break
        }
        case 'facebook': {
          openSharePopup(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          )
          setFeedback({ tone: 'success', message: '페이스북 공유 창을 열었습니다.' })
          break
        }
        case 'naver': {
          openSharePopup(
            `https://share.naver.com/web/shareView?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
          )
          setFeedback({ tone: 'success', message: '네이버 공유 창을 열었습니다.' })
          break
        }
        // [refactored] SDK 페이로드 조립은 shared/lib/kakao로 이동. await 없이 동기 호출해야 팝업이 안 막힌다.
        case 'kakao': {
          shareToKakao({ url: shareUrl, title: shareTitle, description, imageUrl })
          break
        }
      }
    } catch (error) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof Error && error.message
            ? error.message
            : '공유하지 못했습니다. 잠시 후 다시 시도해주세요.',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby="share-modal-description"
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
            <DialogPrimitive.Description id="share-modal-description" className="sr-only">
              공유할 서비스를 선택하세요.
            </DialogPrimitive.Description>
          </div>

          {/* 공유 옵션 행 (Figma 1945-136563) */}
          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6 px-3 py-5">
            {OPTIONS.map((option) => {
              const isKakao = option.key === 'kakao'
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => void share(option.key)}
                  aria-busy={isKakao && !kakaoReady}
                  className="flex flex-col items-center gap-0.5 rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
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
              )
            })}
          </div>

          {feedback && (
            <p
              role="status"
              aria-live="polite"
              className={cn(
                'px-5 pb-5 text-center text-sm leading-[1.5] font-medium',
                feedback.tone === 'error' ? 'text-red-600' : 'text-neutral-700',
              )}
            >
              {feedback.message}
            </p>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { ShareModal }
