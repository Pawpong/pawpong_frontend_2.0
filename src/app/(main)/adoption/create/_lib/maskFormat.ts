/**
 * 입력 마스킹 포맷터 (순수 함수) — MaskedInput 이 쓴다.
 *
 * 하이픈/쉼표 위치를 기억하지 않고 매번 자리수로만 판단해서, 지울 때 구분자에 걸려 멈추지 않는다.
 */

/** 숫자만 남겨 YYYY-MM-DD 로 끼워 넣는다 ('2024-05' 에서 5를 지우면 '2024-0' -> '2024') */
export const formatDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
}

/** 숫자만 남겨 천 단위 쉼표를 넣는다. 선행 0 은 버린다 ('007' -> '7') */
export const formatPriceInput = (value: string): string =>
  value
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/**
 * 포맷 후 캐럿 위치.
 *
 * input.value setter 는 값이 바뀌면 캐럿을 문자열 끝으로 보낸다(HTML 표준).
 * 끝에 이어 칠 때는 티가 안 나지만 중간을 고치면 튀므로 원래 자리로 되돌린다.
 *
 * 길이 차이로 계산하면 구분자 개수가 바뀔 때 어긋난다
 * ('1,9|234,567' -> '19,234,567' 은 길이가 같지만 캐럿은 3이 아니라 2).
 * 그래서 "캐럿 앞의 숫자 개수"를 기준으로 잡는다 — 구분자가 어떻게 재배치돼도 흔들리지 않는다.
 */
export const restoreCaret = (before: string, formatted: string, caret: number): number => {
  const digitsBeforeCaret = before.slice(0, caret).replace(/\D/g, '').length
  if (digitsBeforeCaret === 0) return 0

  let seen = 0
  for (let index = 0; index < formatted.length; index += 1) {
    if (!/\d/.test(formatted.charAt(index))) continue
    seen += 1
    if (seen === digitsBeforeCaret) return index + 1
  }
  return formatted.length
}
