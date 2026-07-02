import { Suspense } from 'react'
import { SignupTypeSelect } from '@/widgets/signup-type-select'
import { SocialSignupCapture } from '@/features/auth'

/**
 * 회원가입 진입 (유형 선택: 입양자 / 브리더)
 *
 * 소셜 신규가입 흐름:
 *   백엔드 OAuth 콜백 → /signup?tempId=...&provider=...&email=...&name=...&profileImage=...
 *   (백엔드: auth-social-signup-redirect-factory.service.ts)
 *   → SocialSignupCapture 가 위 파라미터를 sessionStorage 에 저장(여러 단계 거치며 유지)
 *   → 마지막 단계에서 social/complete 호출로 실제 가입 + 토큰 쿠키 저장
 *
 * 구현 상태:
 *   - 입양자(general): 연동 완료. SurveyStep 의 "다음"에서 completeAdopterRegistration 호출 →
 *     /api/auth/set-cookie 로 로그인 처리 후 complete 단계로 이동.
 *   - TODO(FE) 브리더(breeder): 아직 미연동. KennelInfoStep/DocumentsStep 데이터로
 *     completeBreederRegistration + 서류 업로드(upload-breeder-documents)를 마지막 단계에서 호출해야 함.
 */
const SignupPage = () => {
  return (
    <>
      {/* 소셜 신규가입 파라미터(tempId 등) 캡처 — useSearchParams 사용으로 Suspense 필요 */}
      <Suspense fallback={null}>
        <SocialSignupCapture />
      </Suspense>
      <SignupTypeSelect />
    </>
  )
}

export default SignupPage
