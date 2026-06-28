'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { saveSocialSignupSession } from '../lib/socialSignupSession'

/**
 * /signup 진입 시 소셜 신규가입 파라미터(tempId 등)를 sessionStorage 에 저장한다.
 *
 * 백엔드 신규유저 리다이렉트: /signup?tempId=...&provider=...&email=...&name=...&profileImage=...
 * 화면 출력은 없고(null 반환) 캡처만 담당한다. tempId 가 없으면(직접 /signup 진입) 아무것도 안 함.
 */
export const SocialSignupCapture = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const tempId = searchParams.get('tempId')
    if (!tempId) return
    saveSocialSignupSession({
      tempId,
      provider: searchParams.get('provider') ?? '',
      email: searchParams.get('email') ?? '',
      name: searchParams.get('name') ?? '',
      profileImage: searchParams.get('profileImage') ?? undefined,
    })
  }, [searchParams])

  return null
}
