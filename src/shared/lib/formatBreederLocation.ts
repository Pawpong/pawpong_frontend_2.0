// 특별시·광역시·세종은 하위 지역이 자기 자신을 반복하는 값 하나뿐이다
// (예: city '서울특별시' 의 district 는 항상 '서울시'). 그대로 이어 붙이면
// "서울특별시 서울시" 처럼 같은 지역이 중복 표시된다. 백엔드 브리더 탐색·공개
// 프로필 응답이 이미 이 값들로 내려오는 걸 확인했다 — 프론트에서 조립하는
// 유일한 지점(브리더 홈 프로필 카드)에서 같은 기준으로 생략한다.
//
// 제주특별자치도처럼 실제로 하위 지역이 둘 이상인 곳(서귀포시/제주시)은
// 이 목록에 넣지 않아 그대로 이어 붙는다.
const SINGLE_DISTRICT_CITIES = new Set([
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
])

/** 브리더 사업장 소재지 city/district 를 표시용 문자열로 합친다. */
export const formatBreederLocation = (city?: string, district?: string): string => {
  const cityName = city?.trim() ?? ''
  const districtName = district?.trim() ?? ''

  if (!cityName) return districtName
  if (!districtName || SINGLE_DISTRICT_CITIES.has(cityName)) return cityName

  return `${cityName} ${districtName}`
}
