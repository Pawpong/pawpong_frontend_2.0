'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { CommunityAvatar } from '../../_ui/CommunityAvatar'

interface CommentComposerProps {
  onSubmit: (body: string) => void | Promise<void>
  isSubmitting?: boolean
  hasSubmitError: boolean
  onClearSubmitError: () => void
  /** 작성자(나) 아바타 */
  profileImageUrl?: string
  /** 답글 대상 닉네임 — 있으면 답글 모드 배너 표시 */
  replyingToNickname?: string | null
  onCancelReply?: () => void
}

/**
 * 댓글/답글 입력창 (Figma 2612:269261 comment-input) — 아바타 + 박스(placeholder "댓글달기" + "게시").
 * 답글 모드에서는 대상 닉네임 배너 + 취소를 노출한다. 제출 성공 후 입력값을 비운다.
 */
const CommentComposer = ({
  onSubmit,
  isSubmitting = false,
  hasSubmitError,
  onClearSubmitError,
  profileImageUrl,
  replyingToNickname,
  onCancelReply,
}: CommentComposerProps) => {
  const [value, setValue] = useState('')
  const trimmed = value.trim()
  const inputRef = useRef<HTMLInputElement>(null)

  // 최은진: 답글 대상이 잡히면 인풋에 바로 포커스 — 답글달기 클릭 후 바로 타이핑할 수 있게 (useRef/useEffect 추가)
  useEffect(() => {
    if (replyingToNickname) inputRef.current?.focus()
  }, [replyingToNickname])

  // 실패해도 입력값은 남기고 재시도할 수 있게 — 오류 상태는 호출부 mutation을 단일 출처로 쓴다
  const handleSubmit = async () => {
    if (!trimmed || isSubmitting) return
    try {
      await onSubmit(trimmed)
      setValue('')
    } catch {
      // mutation의 isError로 안내하고, 이벤트 핸들러의 unhandled rejection만 막는다
    }
  }

  return (
    <div className="flex flex-col gap-2 py-3">
      {replyingToNickname && (
        // 최은진: 답글 배너/취소 버튼 색상을 text-text-secondary → text-neutral-700로 교체하고,
        // 취소 버튼에 hover:text-neutral-850 트랜지션 추가
        <div className="flex items-center justify-between text-sm text-neutral-700">
          <span className="font-semibold">@{replyingToNickname}에게 답글</span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-neutral-700 transition-colors hover:text-neutral-850"
          >
            취소
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        {/* 최은진: shared/ui Avatar → CommunityAvatar(로컬)로 교체 — CommunityFeedCard.tsx와
            같은 원칙으로 shared/ui 변경에서 커뮤니티 상세를 분리했다. */}
        <CommunityAvatar src={profileImageUrl} alt="내 프로필" className="shrink-0" />
        {/* 최은진: 테두리 색은 포커스 여부를 그대로 따른다 (회색 → 파랑, focus-within:border-info-500 추가) */}
        <div className="flex h-14 flex-1 items-center justify-between gap-2 rounded-lg border border-neutral-500 p-3 transition-colors focus-within:border-info-500">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (hasSubmitError) onClearSubmitError()
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="댓글달기"
            maxLength={1000}
            className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] font-medium text-neutral-850 outline-none placeholder:text-neutral-500"
          />
          {/* 최은진: 게시 버튼 활성화는 포커스가 아니라 입력값 유무로 판단 — 빈 값이 포커스만으로
              게시되지 않게. disabled 색상 대신 cn()으로 trimmed 여부에 따라 font-weight·색상 분기 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!trimmed || isSubmitting}
            className={cn(
              'shrink-0 text-sm leading-[1.5] whitespace-nowrap transition-colors',
              trimmed ? 'font-semibold text-info-500' : 'font-medium text-neutral-400',
            )}
          >
            게시
          </button>
        </div>
      </div>
      {hasSubmitError && (
        <p role="alert" className="text-xs text-error-700">
          댓글 등록에 실패했습니다. 다시 시도해주세요.
        </p>
      )}
    </div>
  )
}

export { CommentComposer }
