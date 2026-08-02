'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * 소셜 로그인 성공 랜딩 (기존 회원)
 *
 * 백엔드 OAuth 콜백이 토큰을 URL 파라미터로 넘겨준다:
 *   /login/success?accessToken=...&refreshToken=...&returnUrl=...
 *
 * 이 페이지는 토큰을 /api/auth/set-cookie BFF 로 보내 쿠키에 저장한 뒤 returnUrl(없으면 홈)로 이동한다.
 *
 * Client Component 여야 하는 이유:
 * - 브라우저에서 fetch 해야 Set-Cookie 응답 헤더가 현재 origin 쿠키로 적용됨
 *
 * TODO(FE): 전역 auth 상태 스토어 도입 시, 여기서 JWT payload(sub/role)를 디코드해
 *           스토어에도 사용자 정보를 채워 넣는 것을 고려 (현재는 쿠키만으로 동작).
 */
const LoginSuccessContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')
      const returnUrl = searchParams.get('returnUrl') || '/'

      if (!accessToken || !refreshToken) {
        router.replace('/login')
        return
      }

      try {
        const res = await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken }),
          credentials: 'include',
        })

        if (!res.ok) throw new Error('set-cookie 실패')

        // RN WebView 환경이면 네이티브로 accessToken을 전달해 FCM 디바이스 토큰 등록을 트리거한다.
        // (RN HomeScreen이 REQUEST_FCM_TOKEN 수신 → messaging().getToken() → 백엔드 등록)
        const native = (
          window as unknown as { ReactNativeWebView?: { postMessage: (m: string) => void } }
        ).ReactNativeWebView
        if (native) {
          native.postMessage(JSON.stringify({ type: 'REQUEST_FCM_TOKEN', accessToken }))
        }

        router.replace(returnUrl)
      } catch (err) {
        console.error('로그인 처리 중 오류:', err)
        setError('로그인 처리 중 오류가 발생했습니다.')
        setTimeout(() => router.replace('/login'), 2000)
      }
    }

    run()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <p className="mt-2 text-sm text-neutral-700">로그인 페이지로 이동합니다...</p>
        </div>
      ) : (
        <p className="text-sm text-neutral-700">로그인 처리 중...</p>
      )}
    </div>
  )
}

const LoginSuccessPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-700">로그인 처리 중...</p>
      </div>
    }
  >
    <LoginSuccessContent />
  </Suspense>
)

export default LoginSuccessPage
