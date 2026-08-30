/**
 * ISO 날짜 문자열을 표시용 'YYYY년 MM월 DD일생' 으로 변환한다.
 * - 백엔드는 생년월일을 자정(UTC) 기준으로 저장하므로 UTC 게터로 날짜가 밀리지 않게 처리
 * - 파싱할 수 없는 값(이미 포맷된 문자열 등)은 그대로 돌려준다
 */
export const formatBirthDate = (value: string): string => {
  if (!value) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}년 ${m}월 ${d}일생`
}
