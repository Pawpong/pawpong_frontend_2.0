import { defaultStackParser, type ErrorEvent, type EventHint } from '@sentry/nextjs'

const EXTENSION_SCRIPT = /^(?:chrome-extension|moz-extension|safari-web-extension):\/\//

/** SDK가 app:///로 바꾸기 전 원본 스택 전체가 확장 프로그램일 때만 제외한다. */
export function isBrowserExtensionOnlyError(event: ErrorEvent, hint: EventHint): boolean {
  // 원인 체인에 앱 오류가 섞였거나 출처를 증명할 수 없으면 계속 수집한다.
  if (event.exception?.values?.length !== 1) return false
  const original = hint.originalException
  if (!original || typeof original !== 'object' || !('stack' in original)) return false
  if (typeof original.stack !== 'string') return false

  const frames = defaultStackParser(original.stack)
  return (
    frames.length > 0 &&
    frames.every((frame) => Boolean(frame.filename && EXTENSION_SCRIPT.test(frame.filename)))
  )
}
