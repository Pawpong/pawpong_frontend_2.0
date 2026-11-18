const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

const { ApiError } = load('src/shared/api/unwrap.ts')
const socialLogin = load('src/shared/lib/socialLogin.ts', {
  '@/shared/config': { getApiBaseUrl: () => 'https://api.example.test' },
})
const existingProvider = load('src/features/onboarding/model/existingProvider.ts', {
  '@/shared/api': { isApiError: (error) => error instanceof ApiError },
  '@/shared/lib/socialLogin': socialLogin,
})

// React 훅을 렌더 없이 돌린다 — useState 는 호출 순서대로 값을 보관하고, 확인 요청은 정해 둔 오류로 끝난다
const runHook = (verifyError) => {
  const states = []
  let index = 0
  const react = {
    useState: (initial) => {
      const slot = index++
      if (!(slot in states)) states[slot] = initial
      return [states[slot], (value) => (states[slot] = value)]
    },
    useEffect: () => {},
  }
  const { usePhoneVerification } = load('src/features/onboarding/model/usePhoneVerification.ts', {
    react,
    '@/shared/assets': { CheckRoundedIcon: {} },
    '../api/onboarding.mutations': {
      useSendVerificationCode: () => ({ mutate: () => {}, isPending: false }),
      useVerifyCode: () => ({ mutate: (_, { onError }) => onError(verifyError), isPending: false }),
    },
    './existingProvider': existingProvider,
  })
  let failures = 0
  const render = () => {
    index = 0
    return usePhoneVerification({
      isVerified: false,
      onVerifiedChange: () => {},
      onFailure: () => (failures += 1),
    })
  }
  render().verifyCode('01012345678', '123456')
  return { after: render(), failures: () => failures }
}

const conflict = (data) =>
  new ApiError('이미 카카오 계정으로 가입되어 있어요. 카카오로 로그인해 주세요.', 409, undefined, {
    success: false,
    code: 409,
    error: '이미 카카오 계정으로 가입되어 있어요. 카카오로 로그인해 주세요.',
    data,
  })

test('인증번호를 맞혔는데 이미 가입된 번호면 실패로 세지 않고 그 가입 방법으로 보냄', () => {
  const { after, failures } = runHook(
    conflict({ errorCode: 'SOCIAL_PROVIDER_MISMATCH', existingProvider: 'kakao' }),
  )
  // 실패로 세면 2번 뒤 이메일 인증이 열려 다른 이메일로 두 번째 계정을 만들 수 있다
  assert.equal(failures(), 0)
  assert.equal(after.existingProvider, 'kakao')
  assert.equal(after.codeMessage.status, 'error')
  assert.match(after.codeMessage.text, /카카오로 로그인/)
})

test('가입 방법을 모르는 기존 번호도 실패로 세지 않고, 버튼 없이 문구만 보여 줌', () => {
  const { after, failures } = runHook(conflict(undefined))
  assert.equal(failures(), 0)
  assert.equal(after.existingProvider, undefined)
})

test('그냥 틀린 인증번호는 지금처럼 실패로 셈', () => {
  const { after, failures } = runHook(
    new ApiError('인증번호가 일치하지 않습니다. (1/5)', 400, undefined, {}),
  )
  assert.equal(failures(), 1)
  assert.equal(after.existingProvider, undefined)
})
