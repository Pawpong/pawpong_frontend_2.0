import { SignupTypeSelect } from '@/widgets/signup-type-select'

/**
 * 회원가입 진입 (유형 선택: 입양자 / 브리더)
 *
 * ──────────────────────────────────────────────────────────────────────────
 * TODO(FE) — 소셜 "신규 회원" 연동 미완성 지점
 * ──────────────────────────────────────────────────────────────────────────
 * 백엔드 OAuth 콜백은 가입 이력이 없는 신규 소셜 사용자를 아래 쿼리와 함께 이 페이지로 보낸다:
 *   /signup?tempId=...&provider=kakao|naver|google&email=...&name=...&profileImage=...[&needsEmail=true]
 *   (백엔드: auth-social-signup-redirect-factory.service.ts)
 *
 * 현재 이 페이지/온보딩(OnboardingProvider)은 위 파라미터를 읽지 않는다. 연동하려면:
 *   1) useSearchParams() 로 tempId/provider/email/name/profileImage 를 읽어
 *      온보딩 컨텍스트(features/onboarding)의 초기값으로 주입한다.
 *   2) 유형 선택 후 마지막 단계에서 이미 존재하는 뮤테이션으로 가입을 완료한다:
 *        - 입양자: useCompleteAdopterRegistration({ tempId, email, name, nickname, phone, ... })
 *        - 브리더: useCompleteBreederRegistration({ tempId, ... })
 *      (둘 다 features/auth/api/auth.api.ts → POST /api/v2/auth/social/complete)
 *   3) 완료 응답(AuthResponseDto)에서 받은 accessToken/refreshToken 을
 *      /api/auth/set-cookie 로 저장 후 홈으로 이동한다. (로그인 성공과 동일 패턴)
 *
 * 참고: 기존 회원 로그인은 /login → /login/success 로 이미 연결돼 있다.
 * ──────────────────────────────────────────────────────────────────────────
 */
const SignupPage = () => {
  return <SignupTypeSelect />
}

export default SignupPage
