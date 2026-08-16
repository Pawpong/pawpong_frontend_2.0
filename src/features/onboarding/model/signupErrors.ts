/** 가입 마지막 단계에서 앞 단계 누락을 안내하는 문구 (입양자·브리더 공통) */
export const SIGNUP_ERROR = {
  noSocialSession: '소셜 가입 정보가 없습니다. 로그인 화면에서 소셜 로그인으로 다시 시작해주세요.',
  noEmail: '이메일 정보가 없습니다. 로그인 화면에서 소셜 로그인으로 다시 시작해주세요.',
  phoneUnverified: '휴대폰 인증을 완료해주세요. (계정 정보 입력 단계)',
  registerFailed: '회원가입 완료에 실패했습니다.',
} as const
