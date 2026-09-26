/**
 * AI 필터 결과를 커뮤니티 글쓰기로 넘기는 한 번짜리 전달함.
 *
 * File 은 URL·쿼리로 넘길 수 없어 클라이언트 메모리에 잠깐 둔다. 글쓰기 화면이 꺼내 가면 비운다.
 * 새로고침하면 사라지는데, 그때는 글쓰기에서 사진을 다시 고르면 되므로 따로 저장하지 않는다.
 */
let pending: File | null = null

export const setPendingCommunityPhoto = (file: File) => {
  pending = file
}

export const takePendingCommunityPhoto = (): File | null => {
  const file = pending
  pending = null
  return file
}
