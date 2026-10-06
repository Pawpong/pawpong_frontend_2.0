const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function load(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath)
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  })
  const module = { exports: {} }
  const localRequire = (id) => {
    if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts')
    if (!id.startsWith('.')) return require(id)
    return load(
      path.relative(
        path.resolve(__dirname, '..'),
        path.resolve(path.dirname(filename), id + '.ts'),
      ),
    )
  }
  new Function('require', 'module', 'exports', outputText)(localRequire, module, module.exports)
  return module.exports
}

const root = 'src/features/onboarding/model/'
const { hasEmailVerification, hasContactVerification, shouldOfferEmailVerification } = load(
  root + 'contactVerification.ts',
)
const { profileSchema } = load(root + 'schema.ts')
const { parseEmailConfig, parseEmailChallenge, parseEmailProof } = load(
  root + 'emailVerificationContract.ts',
)
const verifiedProfile = () => ({
  email: 'friend@example.test',
  phone: '',
  verificationCode: '',
  phoneVerified: false,
  verificationMethod: 'email',
  emailVerified: true,
  emailVerifiedFor: 'friend@example.test',
  emailVerificationToken: 'A'.repeat(43),
  emailVerificationExpiresAt: new Date(Date.now() + 600_000).toISOString(),
  serviceAgreed: true,
  privacyAgreed: true,
  marketingAgreed: false,
  isOver14: true,
})

test('휴대폰 실패 두 번 이후 서버가 지원할 때 이메일 대안을 제공한다', () => {
  assert.equal(shouldOfferEmailVerification(0, true), false)
  assert.equal(shouldOfferEmailVerification(1, true), false)
  assert.equal(shouldOfferEmailVerification(2, false), false)
  assert.equal(shouldOfferEmailVerification(2, true), true)
})

test('이메일 경로는 휴대폰 미인증이어도 실제 proof가 있으면 진행하며 boolean만으로 진행하지 않는다', () => {
  const profile = verifiedProfile()
  assert.equal(profileSchema.safeParse(profile).success, true)
  assert.equal(hasContactVerification(profile), true)
  assert.equal(
    profileSchema.safeParse({ ...profile, emailVerificationToken: undefined }).success,
    false,
  )
  assert.equal(
    hasContactVerification({ ...profile, emailVerificationToken: undefined, phoneVerified: true }),
    false,
  )
})

test('이메일 변경, 만료, 서버 시차, 잘못된 proof는 진행을 취소한다', () => {
  const now = Date.now()
  const profile = {
    ...verifiedProfile(),
    emailVerificationExpiresAt: new Date(now + 1_000).toISOString(),
  }
  assert.equal(hasEmailVerification(profile, now), true)
  assert.equal(hasEmailVerification(profile, now + 1_000), false)
  assert.equal(hasEmailVerification({ ...profile, email: 'other@example.test' }, now), false)
  assert.equal(hasEmailVerification({ ...profile, emailServerTimeOffsetMs: 2_000 }, now), false)
  assert.equal(
    hasEmailVerification({ ...profile, emailVerificationToken: 'malformed' }, now),
    false,
  )
})

test('기존 전화번호 인증은 그대로 진행하며 국제/빈 전화번호는 전화 경로를 통과하지 않는다', () => {
  const profile = {
    ...verifiedProfile(),
    verificationMethod: 'phone',
    phone: '010-1234-5678',
    phoneVerified: true,
  }
  assert.equal(profileSchema.safeParse(profile).success, true)
  assert.equal(profileSchema.safeParse({ ...profile, phone: '+61 123456789' }).success, false)
  assert.equal(profileSchema.safeParse({ ...profile, phone: '' }).success, false)
  assert.equal(profileSchema.safeParse({ ...profile, phoneVerified: false }).success, false)
})

test('서버 응답이 잘못됐거나 이미 만료된 경우 발송/인증 성공으로 처리하지 않는다', () => {
  const serverTime = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 300_000).toISOString()
  assert.equal(
    parseEmailConfig({
      enabled: true,
      failureThreshold: 2,
      codeTtlSeconds: 300,
      resendSeconds: 60,
      proofTtlSeconds: 1800,
    }).enabled,
    true,
  )
  assert.throws(() => parseEmailConfig({ enabled: 'true' }))
  assert.throws(() =>
    parseEmailChallenge({ challengeId: 'bad', serverTime, expiresAt, nextSendAt: serverTime }),
  )
  assert.throws(() =>
    parseEmailProof({
      emailVerificationToken: 'A'.repeat(43),
      serverTime,
      expiresAt: new Date(0).toISOString(),
    }),
  )
  assert.equal(
    parseEmailProof({ emailVerificationToken: 'A'.repeat(43), serverTime, expiresAt })
      .emailVerificationToken.length,
    43,
  )
})

test('일반 가입 DTO는 실제 인증 이메일과 proof를 전달하고 미인증 전화번호를 제외한다', () => {
  const { buildAdopterRegistrationRequest } = load(root + 'buildAdopterRegistrationRequest.ts')
  const args = {
    social: { tempId: 'signed-fixture-session', email: 'relay@example.test', name: '친구' },
    profile: verifiedProfile(),
    info: { nickname: '친구회원' },
    survey: {},
    termsAgreements: [],
    skipped: true,
  }
  const data = buildAdopterRegistrationRequest(args)
  assert.equal(data.email, 'friend@example.test')
  assert.equal(data.phone, undefined)
  assert.equal(data.verificationMethod, 'email')
  assert.equal(data.emailVerificationToken, args.profile.emailVerificationToken)
  const phoneData = buildAdopterRegistrationRequest({
    ...args,
    profile: { ...args.profile, verificationMethod: 'phone', phone: '01012345678' },
  })
  assert.equal(phoneData.email, args.social.email)
  assert.equal(phoneData.phone, '01012345678')
  assert.equal(phoneData.emailVerificationToken, undefined)
})

test('브리더 가입도 이메일 proof만 보내며 기본 플랜/동의/서류는 유지한다', () => {
  const { buildBreederRegistrationRequest } = load(root + 'buildBreederRegistrationRequest.ts')
  const profile = verifiedProfile()
  const data = buildBreederRegistrationRequest({
    social: { tempId: 'signed-fixture-session', provider: 'apple', email: 'relay@example.test' },
    profile,
    animal: { selected: 'cat' },
    kennel: {
      breederName: '캐터리',
      city: '서울',
      district: '',
      selectedBreeds: ['fixture-breed'],
    },
    uploaded: { uploadedDocuments: [{ filename: 'document.pdf', type: 'id' }] },
  })
  assert.equal(data.email, profile.email)
  assert.equal(data.phoneNumber, undefined)
  assert.equal(data.emailVerificationToken, profile.emailVerificationToken)
  assert.equal(data.plan, 'basic')
  assert.equal(data.agreements.termsOfService, true)
  assert.deepEqual(data.documentUrls, ['document.pdf'])
})

test('같은 탭 새로고침은 proof를 유지하고 만료/다른 소셜 세션은 완료 단계를 취소하며 OTP는 저장하지 않는다', async () => {
  const original = global.sessionStorage
  const values = new Map()
  global.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
  try {
    const first = load(root + 'useOnboardingForm.ts').useOnboardingForm
    first.getState().startSession('owner-one')
    first
      .getState()
      .completeStep('profile', {
        ...verifiedProfile(),
        verificationCode: '111111',
        emailVerificationCode: '222222',
      })
    first.getState().completeStep('info', { nickname: '친구회원', selectedKeywords: [] })
    const stored = JSON.parse(values.get('pawpong:onboarding-form'))
    assert.equal(stored.state.drafts.profile.emailVerificationCode, '')
    assert.equal(stored.state.drafts.profile.verificationCode, '')
    const reloaded = load(root + 'useOnboardingForm.ts').useOnboardingForm
    await reloaded.persist.rehydrate()
    assert.equal(hasContactVerification(reloaded.getState().drafts.profile), true)
    assert.equal(reloaded.getState().completedSteps.includes('profile'), true)
    reloaded
      .getState()
      .saveDraft('profile', {
        ...reloaded.getState().drafts.profile,
        emailVerificationExpiresAt: new Date(0).toISOString(),
      })
    reloaded.getState().invalidateExpiredEmailVerification()
    assert.equal(reloaded.getState().completedSteps.includes('profile'), false)
    assert.equal(reloaded.getState().completedSteps.includes('info'), false)
    reloaded.getState().startSession('owner-two')
    assert.deepEqual(reloaded.getState().drafts, {})
  } finally {
    if (original === undefined) delete global.sessionStorage
    else global.sessionStorage = original
  }
})
