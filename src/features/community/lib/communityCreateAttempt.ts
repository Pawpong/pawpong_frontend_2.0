/**
 * 새 글 저장 한 번의 시도. 같은 내용으로 다시 누르면 같은 식별자를 보내
 * 서버가 이미 저장한 글을 돌려주게 한다(AI 심사를 다시 쓰지 않는다).
 */
export interface CommunityCreateAttempt {
  clientRequestId: string
  /** 이 식별자로 보낸 내용의 지문 — 내용이 바뀌면 새 식별자를 쓴다 */
  signature: string
  /** 이미 올린 사진 파일명. 다시 올리면 파일명이 달라져 서버가 다른 내용으로 본다 */
  uploaded?: string[]
}

function uuidV4(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  // 보안 컨텍스트가 아닌 웹뷰에서는 randomUUID가 없을 수 있다.
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** 사진은 내용을 읽지 않고 이름·크기·수정 시각으로 구분한다. */
export function communityCreateSignature(content: unknown, files: File[]): string {
  return JSON.stringify([content, files.map((file) => [file.name, file.size, file.lastModified])])
}

export function nextCommunityCreateAttempt(
  previous: CommunityCreateAttempt | null,
  signature: string,
): CommunityCreateAttempt {
  return previous?.signature === signature ? previous : { clientRequestId: uuidV4(), signature }
}
