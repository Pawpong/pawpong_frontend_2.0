import { Suspense } from 'react'
import { SignupTypeSelect } from '@/widgets/signup-type-select'
import { SignupSessionCapture } from './_ui/SignupSessionCapture'
import { SignupEntryGuard } from './_ui/SignupEntryGuard'

/**
 * 회원가입 진입 (유형 선택: 입양자 / 브리더)
 *
 * 소셜 신규가입 흐름:
 *   백엔드 OAuth 콜백 → /signup?tempId=...&provider=...&email=...&name=...&profileImage=...
 *   (백엔드: auth-social-signup-redirect-factory.service.ts)
 *   → SocialSignupCapture 가 위 파라미터를 sessionStorage 에 저장(여러 단계 거치며 유지)
 *   → 마지막 데이터 단계에서 실제 가입 호출 + 토큰 쿠키 저장
 *
 * 가입 엔드포인트:
 *   - 입양자(general): SurveyStep → POST /auth/register/adopter
 *     (조사 답변은 counselDefaultProfile, 약관 동의는 termsAgreements 로 함께 전송)
 *   - 브리더(breeder): DocumentsStep → 서류 업로드(upload-breeder-documents) 후
 *     POST /auth/register/breeder (받은 documentUrls 를 요청에 실어 보냄)
 */
const SignupPage = () => {
  return (
    <>
      {/* 소셜 신규가입 파라미터(tempId 등) 캡처 — useSearchParams 사용으로 Suspense 필요 */}
      <Suspense fallback={null}>
        <SignupEntryGuard>
          <SignupSessionCapture />
          <SignupTypeSelect />
        </SignupEntryGuard>
      </Suspense>
    </>
  )
}

export default SignupPage
