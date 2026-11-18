'use client'

import { Button } from '@/shared/ui/Button'
import {
  SOCIAL_PROVIDER_LABEL,
  socialLoginUrl,
  type SocialProvider,
} from '@/shared/lib/socialLogin'

/**
 * 이미 다른 방법으로 가입된 이메일일 때 그 제공자 로그인으로 바로 보내는 버튼.
 * 로그인 화면의 소셜 버튼·안내 모달과 같은 주소 생성기를 써서 어긋나지 않게 한다.
 */
export const ExistingAccountLoginButton = ({ provider }: { provider: SocialProvider }) => (
  <Button
    size="md"
    intent={provider}
    width="full"
    onClick={() => window.location.assign(socialLoginUrl(provider, '/'))}
  >
    {SOCIAL_PROVIDER_LABEL[provider]}로 로그인하기
  </Button>
)
