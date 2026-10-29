/** 바닥에서 이만큼 안쪽이면 "맨 아래를 보고 있다" 로 본다 — 한 줄 남짓한 여유 */
export const BOTTOM_PIN_THRESHOLD_PX = 80

interface ScrollMetrics {
  scrollHeight: number
  scrollTop: number
  clientHeight: number
}

/** 지금 목록의 맨 아래를 보고 있는지 */
export const isPinnedToBottom = ({
  scrollHeight,
  scrollTop,
  clientHeight,
}: ScrollMetrics): boolean => scrollHeight - scrollTop - clientHeight <= BOTTOM_PIN_THRESHOLD_PX

/**
 * 새 메시지가 왔을 때 맨 아래로 따라 내려갈지.
 *
 * 위로 올라가 지난 대화를 읽는 중이면 따라가지 않는다. 상대가 말할 때마다 끌어내리면
 * 읽던 자리를 잃는다. 다만 처음 방을 열었을 때와 내가 보낸 메시지는 언제나 따라간다 —
 * 내가 방금 친 말이 화면 밖에 있으면 보낸 것 같지가 않다.
 */
export const shouldFollowNewMessage = (state: {
  firstPaint: boolean
  pinnedToBottom: boolean
  newestIsMine: boolean
}): boolean => state.firstPaint || state.pinnedToBottom || state.newestIsMine
