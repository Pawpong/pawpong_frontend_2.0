import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'

export interface SupportAnswer {
  sources: { faqId: string; question: string; answer: string }[]
  needsHumanSupport: boolean
}

/** 브리더 질문 게시판과 별개인 서비스 이용 FAQ 안내. */
export async function askSupport(question: string, userType: 'adopter' | 'breeder') {
  const response = await apiClient.post<ApiResponse<SupportAnswer>>(
    `${API_VERSION}/home/support/inquiry`,
    { question, userType },
  )
  return unwrap(response, 'AI 안내를 불러오지 못했습니다.')
}

/** 메일 앱 실행과 별개로 서버가 저장한 피드백 접수번호를 반환한다. */
export async function submitSupportFeedback(question: string, userType: 'adopter' | 'breeder') {
  const response = await apiClient.post<ApiResponse<{ receiptId: string }>>(
    `${API_VERSION}/home/support/feedback`,
    { question, userType },
  )
  return unwrap(response, '피드백을 접수하지 못했습니다.')
}
