'use client'

import { useState } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import type { HelpMessageState } from '@/shared/ui'

interface DuplicateCheckTexts {
  /** 빈 입력 */
  empty: string
  /** 이미 사용 중 */
  duplicate: string
  /** 사용 가능 */
  available: string
  /** 요청 실패 fallback */
  fallback: string
}

// [refactored] 닉네임·브리더명·이메일 등 "isDuplicate(boolean) 반환" 중복검사 뮤테이션의
// 빈값/중복/성공/에러 메시지 처리 공통화 (InfoStep·KennelInfoStep의 판박이 핸들러 통합)
export const useDuplicateCheck = (
  mutation: UseMutationResult<boolean, Error, string>,
  texts: DuplicateCheckTexts,
) => {
  const [message, setMessage] = useState<HelpMessageState | null>(null)

  const check = (value?: string) => {
    if (!value?.trim()) {
      setMessage({ text: texts.empty, status: 'error' })
      return
    }
    mutation.mutate(value.trim(), {
      onSuccess: (isDuplicate) => {
        setMessage(
          isDuplicate
            ? { text: texts.duplicate, status: 'error' }
            : { text: texts.available, status: 'success' },
        )
      },
      onError: (error) => {
        setMessage({
          text: error instanceof Error ? error.message : texts.fallback,
          status: 'error',
        })
      },
    })
  }

  return { message, check, isPending: mutation.isPending }
}
