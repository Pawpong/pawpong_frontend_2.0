export const PHONE_FAILURE_THRESHOLD = 2

export const normalizeSignupEmail = (email: string) => email.trim().toLowerCase()

interface ContactVerificationState {
  email: string
  phoneVerified: boolean
  verificationMethod?: 'phone' | 'email'
  emailVerified?: boolean
  emailVerifiedFor?: string
  emailVerificationToken?: string
  emailVerificationExpiresAt?: string
  emailServerTimeOffsetMs?: number
}

/** 화면 진행용 판정이다. 실제 가입 허용은 서버가 proof의 세션/주소/만료/소비를 검증한다. */
export const hasEmailVerification = (
  profile: ContactVerificationState | undefined,
  now = Date.now(),
) =>
  Boolean(
    profile?.emailVerified &&
    profile.emailVerifiedFor === normalizeSignupEmail(profile.email) &&
    /^[A-Za-z0-9_-]{43}$/.test(profile.emailVerificationToken ?? '') &&
    Date.parse(profile.emailVerificationExpiresAt ?? '') >
      now + (profile.emailServerTimeOffsetMs ?? 0),
  )

export const hasContactVerification = (profile: ContactVerificationState | undefined) =>
  profile?.verificationMethod === 'email'
    ? hasEmailVerification(profile)
    : Boolean(profile?.phoneVerified)

export const shouldOfferEmailVerification = (failures: number, supported: boolean) =>
  supported && failures >= PHONE_FAILURE_THRESHOLD
