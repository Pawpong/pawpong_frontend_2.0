import { ApiError } from './unwrap'

/** 인증은 복구됐지만 부작용 있는 요청은 다시 실행하지 않았음을 구분한다. */
export class AuthWriteRetryRequiredError extends ApiError {
  constructor() {
    super('로그인 정보를 갱신했어요. 내용을 확인한 뒤 다시 시작해 주세요.', 401)
    this.name = 'AuthWriteRetryRequiredError'
  }
}
