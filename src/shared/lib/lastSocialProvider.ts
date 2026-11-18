/**
 * 마지막으로 로그인·가입한 소셜 제공자. 로그인 화면의 '최근 사용' 표시에만 쓴다.
 * 인증과 무관해 로그아웃해도 지우지 않는다 — 다음에 어느 버튼으로 들어왔는지 떠올리게 하는 값이다.
 * 값은 제공자 이름(kakao 등)만 담고, 심는 곳은 /api/auth/set-cookie 한 곳이다.
 * (인증 API 라우트가 가져다 쓰므로 다른 모듈을 import 하지 않는다)
 */
export const LAST_SOCIAL_PROVIDER_COOKIE = 'pawpong_last_provider'
