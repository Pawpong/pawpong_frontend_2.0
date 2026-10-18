import { HelpMessage } from '@/shared/ui'

// 스텝 검증 에러 — '다음' 버튼 위가 아니라 해당 필드 바로 밑에 띄운다
const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <HelpMessage status="error" className="mt-1">
      {message}
    </HelpMessage>
  ) : null

export { FieldError }
