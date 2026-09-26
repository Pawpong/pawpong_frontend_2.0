'use client'

import { useEffect, useState } from 'react'
import { apiClient, API_VERSION, normalizeApiError, unwrap } from '@/shared/api'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'

type ConsentStatus = { version: string; accepted: boolean; consentedAt: string | null }

export function ContentRightsContent() {
  const [status, setStatus] = useState<ConsentStatus | null>(null)
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void apiClient.get(`${API_VERSION}/content-rights/me`)
      .then((response) => { if (active) setStatus(unwrap<ConsentStatus>(response)) })
      .catch((cause) => { if (active) setError(normalizeApiError(cause, '동의 상태를 불러오지 못했어요.').message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function submit() {
    if (!checked || saving || !status) return
    setSaving(true)
    setError('')
    try {
      const response = await apiClient.post(`${API_VERSION}/content-rights/me`, {
        version: status.version,
        accepted: true,
      })
      setStatus(unwrap<ConsentStatus>(response))
      window.dispatchEvent(new Event('pawpong:content-rights-updated'))
    } catch (cause) {
      setError(normalizeApiError(cause, '동의를 저장하지 못했어요.').message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-168 flex-col gap-5 px-4 py-6 tab:px-8 tab:py-10">
      <div className="rounded-xl border border-secondary-400 bg-secondary-50 p-5 tab:p-7">
        <h1 className="font-cafe24 text-xl text-neutral-850 tab:text-2xl">내 게시물을 앱에서도 보여주세요</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-700">
          기존 게시물과 사진은 작성자가 허락하기 전까지 포퐁 iOS 앱의 공개 목록과 상세 화면에 표시하지 않아요.
          동의하지 않아도 계정 조회와 삭제 요청은 계속 이용할 수 있어요.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-150 bg-white p-5 text-sm leading-6 text-neutral-700 tab:p-7">
        <h2 className="mb-3 font-semibold text-neutral-850">게시물 표시 허락 범위</h2>
        <p>
          내가 포퐁에 공개한 게시물, 사진, 영상과 소개를 포퐁이 서비스를 운영하는 동안 포퐁 웹사이트와 앱에
          저장·복제·전송·표시하고 화면에 맞게 크기와 파일 형식을 바꾸는 것을 무상·비독점적으로 허락합니다.
          이 허락은 포퐁 서비스 안에서만 적용되며, 외부 광고 사용이나 제3자에 대한 재허락을 포함하지 않습니다.
        </p>
        <p className="mt-3">
          내가 올린 자료를 사용할 권리가 있고, 다른 사람이나 촬영 대상의 권리가 필요한 경우 필요한 허락을 받았음을 확인합니다.
          게시물을 삭제하면 해당 게시물의 공개 표시는 중단됩니다. 이전에 작성한 게시물도
          아래에서 직접 동의한 뒤에만 앱에 표시됩니다.
        </p>
      </div>

      {loading ? <p className="text-sm text-neutral-500">동의 상태를 확인하고 있어요.</p> : status?.accepted ? (
        <div className="rounded-xl border border-secondary-400 bg-secondary-50 p-5" role="status">
          <p className="font-semibold text-neutral-850">앱 표시 동의가 저장됐어요.</p>
          <p className="mt-1 text-sm text-neutral-700">공개 게시물은 앱에서 다시 보일 수 있어요.</p>
        </div>
      ) : (
        <>
          <label className="flex cursor-pointer items-start gap-2 text-sm leading-6 text-neutral-850">
            <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} aria-label="게시물 앱 표시 허락에 동의" />
            <span>위 허락 범위와 권리 확인 내용을 읽었고, 내 기존 공개 게시물의 앱 표시에 동의합니다.</span>
          </label>
          <Button onClick={submit} disabled={!checked || saving || !status} size="lg" className="w-full">
            {saving ? '저장하는 중...' : '동의하고 앱에 표시하기'}
          </Button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-error-600">{error}</p>}
    </section>
  )
}
