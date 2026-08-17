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
  /** 확인 버튼을 누르지 않았거나 확인 후 값을 바꾼 경우 */
  unchecked: string
}

// [refactored] 닉네임·브리더명·이메일 등 "isDuplicate(boolean) 반환" 중복검사 뮤테이션의
// 빈값/중복/성공/에러 메시지 처리 공통화 (InfoStep·KennelInfoStep의 판박이 핸들러 통합)
export const useDuplicateCheck = (
  mutation: UseMutationResult<boolean, Error, string>,
  texts: DuplicateCheckTexts,
) => {
  const [message, setMessage] = useState<HelpMessageState | null>(null)
  const [checkedValue, setCheckedValue] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)

  const check = (value?: string) => {
    if (!value?.trim()) {
      setCheckedValue(null)
      setIsAvailable(false)
      setMessage({ text: texts.empty, status: 'error' })
      return
    }
    mutation.mutate(value.trim(), {
      onSuccess: (isDuplicate) => {
        setCheckedValue(value.trim())
        setIsAvailable(!isDuplicate)
        setMessage(
          isDuplicate
            ? { text: texts.duplicate, status: 'error' }
            : { text: texts.available, status: 'success' },
        )
      },
      onError: (error) => {
        setCheckedValue(null)
        setIsAvailable(false)
        setMessage({
          text: error instanceof Error ? error.message : texts.fallback,
          status: 'error',
        })
      },
    })
  }

  const reset = () => {
    setCheckedValue(null)
    setIsAvailable(false)
    setMessage(null)
  }

  const validate = (value: string): boolean => {
    if (isAvailable && checkedValue === value.trim()) return true
    setMessage({ text: texts.unchecked, status: 'error' })
    return false
  }

  return { message, check, reset, validate, isPending: mutation.isPending }
}
