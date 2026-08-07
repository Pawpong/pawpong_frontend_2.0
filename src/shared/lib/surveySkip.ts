// 온보딩에서 '다음에 작성하기'로 조사 양식을 건너뛴 입양자 표시 —
// apply 신청서에서 조사 항목(자기소개/집 비우는 시간/공간)을 다시 노출하기 위한 플래그.
// ponytail: 임시 로컬 플래그. 백엔드 프로필에 survey 완료 여부가 생기면 그 값으로 교체.
const KEY = 'pawpong:survey-skipped'

export const markSurveySkipped = () => localStorage.setItem(KEY, '1')
export const isSurveySkipped = () =>
  typeof window !== 'undefined' && localStorage.getItem(KEY) === '1'
export const clearSurveySkipped = () => localStorage.removeItem(KEY)
