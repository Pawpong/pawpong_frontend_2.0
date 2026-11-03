'use client'

import { useCallback, useState } from 'react'
import { useAuthStatus } from './useAuthStatus'

/**
 * 로그인이 필요한 동작을 감싸는 가드.
 * 비로그인 상태면 요청을 보내지 않고(401로 떨어지므로) 안내 모달을 연다.
 *
 * @example
 * const { guard, isPromptOpen, setPromptOpen } = useLoginGuard()
 * <button onClick={guard(toggleLike)} />
 * <LoginPromptModal open={isPromptOpen} onOpenChange={setPromptOpen} description="..." />
 */
const useLoginGuard = () => {
  const { isLoggedIn } = useAuthStatus()
  const [isPromptOpen, setPromptOpen] = useState(false)

  const guard = useCallback(
    (action: () => void) => () => {
      if (isLoggedIn) {
        action()
        return
      }
      setPromptOpen(true)
    },
    [isLoggedIn],
  )

  return { isLoggedIn, guard, openPrompt: () => setPromptOpen(true), isPromptOpen, setPromptOpen }
}

export { useLoginGuard }
