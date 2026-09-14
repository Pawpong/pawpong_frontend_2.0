/**
 * 온보딩 화면을 손볼 때 폼 검증과 진입 가드를 함께 끈다.
 *
 * 끄는 것: 스텝별 zod 검증, '다음' 버튼 비활성, 소셜 가입 세션·단계 순서 가드.
 * (가드를 안 풀면 세션이 없어 /signup → /login 으로 튕겨 화면을 볼 수가 없다)
 *
 * `.env.local` 에 `NEXT_PUBLIC_SKIP_ONBOARDING_VALIDATION=true` 를 두면 켜진다.
 * 배포 환경에는 이 변수가 없으므로 항상 꺼진 상태다.
 *
 * 끄는 것은 "다음으로 넘어가기 위한 프론트 검증"뿐이다 — 서버는 그대로 검증하므로,
 * 빈 값으로 끝까지 진행하면 마지막 가입 요청에서 거절된다. 화면 배치·흐름을 보는 용도다.
 */
export const SKIP_ONBOARDING_VALIDATION =
  process.env.NEXT_PUBLIC_SKIP_ONBOARDING_VALIDATION === 'true'
