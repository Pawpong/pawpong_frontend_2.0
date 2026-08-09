/** 게시글 이미지가 업로드되는 스토리지 폴더 */
export const COMMUNITY_UPLOAD_FOLDER = 'community'

// 경로 앞에 버킷 세그먼트가 붙을 수 있으므로 업로드 폴더 세그먼트를 경계까지 확인하고 그 뒤만 취한다.
const FILE_NAME_PATTERN = new RegExp(`(?:^|/)(${COMMUNITY_UPLOAD_FOLDER}/.+)$`)

/**
 * 게시글 사진 URL → 백엔드가 받는 fileName (`community/xxx.jpg`).
 *
 * URL 경로를 그대로 쓰면 안 된다. 스토리지에 따라 앞에 버킷 세그먼트가 붙는다.
 * - `https://kr.object.iwinv.kr/pawpong_s3/community/xxx.jpg` → 경로에 버킷(pawpong_s3) 포함
 * - `https://cdn.pawpong.kr/community/xxx.jpg` → 버킷 없음
 *
 * 예상 밖의 형태면 null 을 돌려주고, 호출부는 사진 목록 전송을 건너뛴다(기존 사진 유지).
 */
export const toCommunityPhotoFileName = (url: string): string | null => {
  const path = new URL(url, window.location.origin).pathname
  return path.match(FILE_NAME_PATTERN)?.[1] ?? null
}
