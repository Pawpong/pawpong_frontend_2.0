import type { ChatMessageResponseDto } from '@/shared/types'

/**
 * 상대가 어디까지 읽었는지 — 그 메시지의 인덱스. 알려줄 것이 없으면 -1.
 *
 * 서버는 읽음 시각 이전 메시지를 한 번에 읽음으로 바꾸므로 읽은 범위는 항상 앞에서부터 이어진다.
 * 상대가 보낸 메시지도 읽은 것으로 센다 — 내 메시지만 보면 상대가 답장한 뒤에도 표시가
 * 답장 위에 남아 "답장은 왔는데 아직 안 읽음" 처럼 읽힌다.
 *
 * 내가 보낸 메시지 중 읽힌 것이 하나도 없으면 -1 이다. 상대가 자기 글을 읽은 것은
 * 알려줄 가치가 없고, 표시만 떠 있으면 내 메시지를 읽었다는 뜻으로 오해된다.
 */
export const findCounterpartReadIndex = (messages: ChatMessageResponseDto[]): number => {
  let readIndex = -1
  let sawMyReadMessage = false
  messages.forEach((message, index) => {
    if (message.isMine && !message.isRead) return
    readIndex = index
    if (message.isMine) sawMyReadMessage = true
  })
  return sawMyReadMessage ? readIndex : -1
}
