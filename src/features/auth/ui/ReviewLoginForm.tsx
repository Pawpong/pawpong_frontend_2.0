'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { normalizeReturnUrl } from '@/shared/lib/normalizeReturnUrl'
import { reviewLoginErrorMessage, reviewLoginRequestSchema } from '@/shared/lib/reviewLogin'
import { signInReviewAccount } from '../api/review-login'

export function ReviewLoginForm({ returnUrl }: { returnUrl: string }) {
  const router = useRouter()
  const activeRequest = useRef<AbortController | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => activeRequest.current?.abort(), [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (activeRequest.current) return
    const form = event.currentTarget
    const fields = new FormData(form)
    const credentials = reviewLoginRequestSchema.safeParse({
      emailAddress: fields.get('emailAddress'),
      password: fields.get('password'),
    })
    if (!credentials.success) {
      setError(reviewLoginErrorMessage(400))
      return
    }

    const controller = new AbortController()
    activeRequest.current = controller
    setSubmitting(true)
    setError('')
    try {
      const saved = await signInReviewAccount(credentials.data, controller.signal)
      if (controller.signal.aborted) return
      if (!saved) {
        setError('로그인 세션을 저장하지 못했어요. 다시 로그인해 주세요.')
        return
      }
      router.replace(normalizeReturnUrl(returnUrl))
      router.refresh()
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : reviewLoginErrorMessage(503))
      }
    } finally {
      // 입력한 비밀번호는 요청이 끝나면 폼에서도 비운다.
      const password = form.elements.namedItem('password')
      if (password instanceof HTMLInputElement) password.value = ''
      activeRequest.current = null
      if (!controller.signal.aborted) setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={submit} aria-busy={submitting}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="review-email">이메일</Label>
        <Input
          id="review-email"
          name="emailAddress"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="email"
          placeholder="전달받은 심사 계정 이메일"
          maxLength={254}
          required
          readOnly={submitting}
          className="h-12 text-base"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="review-password">비밀번호</Label>
        <Input
          id="review-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="전달받은 비밀번호"
          maxLength={72}
          required
          readOnly={submitting}
          aria-describedby={error ? 'review-login-error' : undefined}
          className="h-12 text-base"
        />
      </div>
      {error && (
        <p id="review-login-error" role="alert" className="text-sm text-error-500">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
        {submitting ? '로그인 중…' : '심사용 계정으로 로그인'}
      </Button>
    </form>
  )
}
