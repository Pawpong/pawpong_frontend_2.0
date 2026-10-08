export type PlayShareOutcome = 'shared' | 'copied' | 'cancelled' | 'fallback'

type ShareNavigator = {
  share?: (data: { title: string; text: string }) => Promise<void>
  clipboard?: { writeText?: (text: string) => Promise<void> }
}

// 시스템 공유 → 클립보드 → 직접 복사 순서로 시도한다. 사용자가 공유창을 닫은 것은 실패가 아니다.
export async function sharePlayCard(
  nav: ShareNavigator,
  content: { title: string; text: string },
): Promise<PlayShareOutcome> {
  try {
    if (typeof nav.share === 'function') {
      await nav.share(content)
      return 'shared'
    }
    if (typeof nav.clipboard?.writeText === 'function') {
      await nav.clipboard.writeText(content.text)
      return 'copied'
    }
    return 'fallback'
  } catch (error) {
    return (error as { name?: unknown } | null)?.name === 'AbortError' ? 'cancelled' : 'fallback'
  }
}

export const PLAY_SHARE_MESSAGES: Record<PlayShareOutcome, string> = {
  shared: '카드를 공유했어요.',
  copied: '카드 내용을 복사했어요. 함께할 사람에게 보내보세요.',
  cancelled: '공유를 취소했어요. 카드는 그대로 있어요.',
  fallback: '이 환경에서는 바로 공유할 수 없어요. 아래 내용을 직접 복사해 주세요.',
}
