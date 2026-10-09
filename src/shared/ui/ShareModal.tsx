'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/shared/lib/cn'
import { SHARE_IMAGE } from '@/shared/config/site'
import { summarizeShareText } from '@/shared/lib/metadata'
import { getKakao, shareToKakao } from '@/shared/lib/kakao'
import {
  hasNativeCapability,
  shareNatively,
  subscribeNativeCapabilities,
} from '@/shared/lib/nativeBridge'
import { Dialog, DialogOverlay, DialogPortal } from './Dialog'
import { ShareModalIcon } from './ShareModalIcon'
import styles from './ShareModal.module.css'

// 공유 제공자와 native bridge의 동작은 유지하고, 팝업 안의 표현만 전용 스타일로 구성한다.

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

type ShareKey = 'kakao' | 'facebook' | 'naver' | 'copy' | 'native'
const supportsDeviceShare = () =>
  hasNativeCapability('nativeShare') || typeof navigator.share === 'function'
const serverShareSnapshot = () => false

interface ShareFeedback {
  tone: 'success' | 'error'
  message: string
}

const SOCIAL_OPTIONS = [
  { key: 'kakao', label: '카카오톡' },
  { key: 'facebook', label: '페이스북' },
  { key: 'naver', label: '네이버 블로그' },
] as const

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
  const [kakaoReady, setKakaoReady] = useState(false)
  const [kakaoError, setKakaoError] = useState<string | null>(null)
  const [kakaoAttempt, setKakaoAttempt] = useState(0)
  const [feedback, setFeedback] = useState<ShareFeedback | null>(null)
  const [pending, setPending] = useState<ShareKey | null>(null)
  const [previousOpen, setPreviousOpen] = useState(open)
  const inFlight = useRef(false)
  const feedbackVersion = useRef(0)
  const deviceShare = useSyncExternalStore(
    subscribeNativeCapabilities,
    supportsDeviceShare,
    serverShareSnapshot,
  )

  // 부모가 open=false로 닫아도 다음 열림에 이전 안내/대기 상태를 가져오지 않는다.
  // 조건부 상태 조정으로 effect 뒤의 추가 렌더 없이 닫힌 렌더에서 정리한다.
  if (previousOpen !== open) {
    setPreviousOpen(open)
    if (!open) {
      setKakaoReady(false)
      setKakaoError(null)
      setFeedback(null)
      setPending(null)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      feedbackVersion.current += 1
      inFlight.current = false
      setKakaoReady(false)
      setKakaoError(null)
      setFeedback(null)
      setPending(null)
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
      .catch((error: unknown) => {
        if (!cancelled)
          setKakaoError(error instanceof Error ? error.message : '카카오 공유를 불러오지 못했어요.')
      })

    return () => {
      cancelled = true
      feedbackVersion.current += 1
      inFlight.current = false
    }
  }, [open, kakaoAttempt])

  const share = async (key: ShareKey) => {
    // React 렌더 전에 들어오는 연속 클릭도 한 요청으로 묶는다. 제공자 팝업은 await 전에 연다.
    if (inFlight.current) return
    inFlight.current = true
    const version = feedbackVersion.current
    setPending(key)
    setFeedback(null)
    const report = (next: ShareFeedback) => {
      if (version === feedbackVersion.current) setFeedback(next)
    }

    try {
      const shareUrl = new URL(url ?? window.location.pathname, window.location.origin).href
      const shareTitle = summarizeShareText(title ?? document.title, 200)
      const shareDescription = description ? summarizeShareText(description, 200) : undefined
      switch (key) {
        case 'native': {
          if (hasNativeCapability('nativeShare')) {
            await shareNatively({ url: shareUrl, title: shareTitle, message: shareDescription })
          } else {
            await navigator.share({ url: shareUrl, title: shareTitle, text: shareDescription })
          }
          break
        }
        case 'copy': {
          await copyToClipboard(shareUrl)
          report({ tone: 'success', message: 'URL을 복사했습니다.' })
          break
        }
        case 'facebook': {
          openSharePopup(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          )
          report({ tone: 'success', message: '페이스북 공유 창을 열었습니다.' })
          break
        }
        case 'naver': {
          openSharePopup(
            `https://share.naver.com/web/shareView?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
          )
          report({ tone: 'success', message: '네이버 공유 창을 열었습니다.' })
          break
        }
        // [refactored] SDK 페이로드 조립은 shared/lib/kakao로 이동. await 없이 동기 호출해야 팝업이 안 막힌다.
        case 'kakao': {
          shareToKakao({
            url: shareUrl,
            title: shareTitle,
            description: shareDescription,
            imageUrl: imageUrl || SHARE_IMAGE,
          })
          break
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      report({
        tone: 'error',
        message:
          error instanceof Error && error.message
            ? error.message
            : '공유하지 못했어요. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      // 닫힌 팝업의 늦은 완료가 재열린 팝업의 새 요청을 풀지 않도록 한다.
      if (version === feedbackVersion.current) {
        inFlight.current = false
        setPending(null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-modal -translate-x-1/2 -translate-y-1/2',
            styles.content,
            className,
          )}
        >
          <DialogPrimitive.Close type="button" aria-label="닫기" className={styles.close}>
            <ShareModalIcon kind="close" />
          </DialogPrimitive.Close>
          <div className={styles.body}>
            <div className={styles.header}>
              <DialogPrimitive.Title className={cn('font-cafe24', styles.title)}>
                공유하기
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className={styles.description}>
                함께 보고 싶은 소식을 나눠요.
              </DialogPrimitive.Description>
            </div>

            <div className={styles.socialOptions}>
              {SOCIAL_OPTIONS.map((option) => {
                const isKakao = option.key === 'kakao'
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => void share(option.key)}
                    disabled={isKakao && !kakaoReady}
                    aria-disabled={pending !== null}
                    aria-busy={pending === option.key || (isKakao && !kakaoReady && !kakaoError)}
                    className={styles.socialOption}
                  >
                    <ShareModalIcon kind={option.key} className={styles.socialIcon} />
                    <span className={styles.optionLabel}>{option.label}</span>
                  </button>
                )
              })}
            </div>

            <div className={styles.utilityOptions}>
              <button
                type="button"
                onClick={() => void share('copy')}
                aria-disabled={pending !== null}
                aria-busy={pending === 'copy'}
                className={styles.utilityOption}
              >
                <ShareModalIcon kind="copy" className={styles.utilityIcon} />
                <span className={styles.optionLabel}>URL 복사</span>
              </button>
              {deviceShare && (
                <button
                  type="button"
                  onClick={() => void share('native')}
                  aria-disabled={pending !== null}
                  aria-busy={pending === 'native'}
                  className={styles.utilityOption}
                >
                  <ShareModalIcon kind="native" className={styles.utilityIcon} />
                  <span className={styles.optionLabel}>다른 앱</span>
                </button>
              )}
            </div>

            {kakaoError && (
              <div role="status" className={styles.sdkError}>
                <p>{kakaoError}</p>
                <button
                  type="button"
                  className={styles.retry}
                  disabled={pending !== null}
                  onClick={() => {
                    setKakaoError(null)
                    setKakaoReady(false)
                    setKakaoAttempt((attempt) => attempt + 1)
                  }}
                >
                  카카오 공유 다시 불러오기
                </button>
              </div>
            )}
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={styles.feedback}
              data-active={!!(pending || feedback)}
              data-tone={feedback?.tone}
            >
              {pending
                ? pending === 'copy'
                  ? 'URL을 복사하고 있어요.'
                  : '공유 창을 여는 중이에요.'
                : feedback?.message}
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { ShareModal }
