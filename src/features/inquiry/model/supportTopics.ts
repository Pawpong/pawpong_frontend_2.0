export const SUPPORT_TOPICS = [
  {
    id: 'usage',
    label: '이용 방법',
    greeting: '안녕하세요! 포퐁 AI예요. 포퐁 이용 방법이나 정책에 대해 궁금한 점을 물어보세요.',
    placeholder: '포퐁 이용에 대해 물어보세요',
    suggestions: ['AI 사진은 어떻게 만드나요?', '입양 신청은 어떻게 하나요?'],
  },
  {
    id: 'error',
    label: '오류 신고',
    greeting:
      '이용 중 불편하셨군요. 어느 화면에서 어떤 문제가 생겼는지 알려주시면 함께 정리해 드릴게요.',
    placeholder: '어느 화면에서 문제가 생겼나요?',
    suggestions: ['사진이 올라가지 않아요', '화면이 멈췄어요'],
  },
  {
    id: 'account',
    label: '계정 문의',
    greeting:
      '로그인이나 계정 설정에 관해 궁금한 점을 알려주세요. 계정 확인이 필요한 내용은 운영팀에 전달할 수 있어요.',
    placeholder: '계정에 대해 궁금한 점을 적어주세요',
    suggestions: ['로그인이 잘 안 돼요', '탈퇴는 어떻게 하나요?'],
  },
  {
    id: 'feedback',
    label: '개선 제안',
    greeting:
      '포퐁에서 바라는 점이 있나요? 어떤 상황에서 필요했는지 이야기해 주시면 운영팀에 보낼 제안을 함께 다듬어 드릴게요.',
    placeholder: '불편했던 점이나 바라는 기능을 알려주세요',
    suggestions: ['이런 기능이 있으면 좋겠어요', '사용하면서 불편한 점이 있어요'],
  },
] as const

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]['id']
export const MAX_SUPPORT_MESSAGE_LENGTH = 1900
