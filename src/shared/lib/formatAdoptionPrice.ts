/**
 * 분양가 표기 — 미등록이면 금액 대신 문의로 안내한다.
 *
 * 서버가 미등록을 한 가지 값으로 내려주지 않는다. 같은 개체인데 목록(home/available-pets)은
 * null, 상세(adoption/:id)는 0 을 준다. 0 을 그대로 '0원' 으로 찍으면 무료 분양으로 읽혀
 * 분쟁이 되므로 0 과 null 을 모두 미등록으로 본다.
 */
export function formatAdoptionPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return '가격 문의'
  return `${price.toLocaleString('ko-KR')}원`
}
