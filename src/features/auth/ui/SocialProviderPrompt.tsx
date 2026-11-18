'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CtaModal } from '@/shared/ui'
import { normalizeReturnUrl } from '@/shared/lib/normalizeReturnUrl'
import { SOCIAL_PROVIDER_LABEL, isSocialProvider, socialLoginUrl } from '../lib/socialLogin'

/**
 * 같은 이메일이 다른 소셜로 가입돼 있을 때 어디로 로그인할지 알려 주는 모달.
 *
 * 백엔드 콜백이 `/login?error=...&type=login_error&provider=kakao` 로 보낸다.
 * 제목이 어느 쪽으로 가입했는지 그대로 말하므로 설명은 두지 않고, 버튼 하나로 그 제공자의
 * 로그인까지 바로 보낸다. 다른 방법으로 가려면 모달을 닫으면 된다.
 *
 * 탈퇴 계정(type=deleted_account)은 ReactivateAccountPrompt 가 복구 모달로 따로 안내한다.
 */
const SocialProviderPrompt = () => {
  const searchParams = useSearchParams()
  const [dismissed, setDismissed] = useState(false)

  const provider = searchParams.get('provider')
  const returnUrl = normalizeReturnUrl(searchParams.get('returnUrl'))
  const isDeletedAccount = searchParams.get('type') === 'deleted_account'

  if (isDeletedAccount || !isSocialProvider(provider)) return null

  const label = SOCIAL_PROVIDER_LABEL[provider]

  return (
    <CtaModal
      open={!dismissed}
      onOpenChange={(next) => {
        if (!next) setDismissed(true)
      }}
      title={`${label}로 가입한 계정이에요`}
      actions={[
        {
          label: `${label}로 로그인하기`,
          intent: 'primary',
          onClick: () => window.location.assign(socialLoginUrl(provider, returnUrl)),
        },
      ]}
    />
  )
}

export { SocialProviderPrompt }
