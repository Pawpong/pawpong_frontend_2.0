'use client'

import { useEffect, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import Image from 'next/image'
import { CloseIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { getKakao, shareToKakao } from '@/shared/lib/kakao'
import { Dialog, DialogOverlay, DialogPortal } from './Dialog'

/* 공유하기 모달 (Figma 1949-253368) — 인스타/카카오톡/페이스북/URL 복사 */

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

type ShareKey = 'instagram' | 'kakao' | 'facebook' | 'copy'

interface ShareFeedback {
  tone: 'success' | 'info' | 'error'
  message: string
}

const OPTIONS: { key: ShareKey; label: string; icon: string; circle: string }[] = [
  {
    key: 'instagram',
    label: '인스타그램',
    icon: '/images/share/instagram.svg',
    circle: 'border border-neutral-150 bg-white',
  },
  { key: 'kakao', label: '카카오톡', icon: '/images/share/kakaotalk.svg', circle: 'bg-[#ffe812]' },
  {
    key: 'facebook',
    label: '페이스북',
    icon: '/images/share/facebook.png',
    circle: 'bg-[#0866ff]',
  },
  { key: 'copy', label: 'URL 복사', icon: '/images/share/link.svg', circle: 'bg-neutral-100' },
]

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

const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'

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

  // 모달이 열린 동안 SDK를 미리 로드/init만 해둔다. 실제 공유는 클릭 시 동기로 호출.
  useEffect(() => {
    if (!open) {
      setKakaoReady(false)
      setFeedback(null)
      return
    }

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
          const popup = window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'popup,width=720,height=640',
          )
          if (!popup) throw new Error('팝업이 차단되었습니다.')
          popup.opener = null
          setFeedback({ tone: 'success', message: '페이스북 공유 창을 열었습니다.' })
          break
        }
        case 'instagram': {
          const shareData = { title: shareTitle, text: description, url: shareUrl }
          if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
            await navigator.share(shareData)
            setFeedback({ tone: 'success', message: '공유를 완료했습니다.' })
          } else {
            await copyToClipboard(shareUrl)
            setFeedback({
              tone: 'info',
              message: '이 브라우저에서는 인스타그램 직접 공유를 지원하지 않아 URL을 복사했습니다.',
            })
          }
          break
        }
        // [refactored] SDK 페이로드 조립은 shared/lib/kakao로 이동. await 없이 동기 호출해야 팝업이 안 막힌다.
        case 'kakao': {
          shareToKakao({ url: shareUrl, title: shareTitle, description, imageUrl })
          break
        }
      }
    } catch (error) {
      if (isAbortError(error)) {
        setFeedback({ tone: 'info', message: '공유를 취소했습니다.' })
        return
      }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
