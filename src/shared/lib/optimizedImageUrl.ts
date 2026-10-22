/**
 * Next.js 이미지 최적화 경로로 바꾼 주소.
 *
 * next/image 를 쓸 수 없는 자리를 위한 것이다. Radix 아바타처럼 외부 컴포넌트가 평범한
 * `<img>` 를 그리거나, 채팅 첨부처럼 호스트가 환경마다 달라 next/image 에 맡기지 못하는 곳은
 * 4000px 원본이 40px 자리에 그대로 들어온다.
 *
 * srcSet 은 붙이지 않는다. Radix 아바타는 로딩 상태를 재려고 `src` 하나만 미리 받아보므로,
 * 브라우저가 srcSet 에서 다른 폭을 고르면 같은 사진을 두 번 내려받는다.
 */

/** 최적화기가 받아주는 폭 — next.config 가 정하지 않았으므로 images.imageSizes 기본값이다 */
const OPTIMIZER_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384]
const LARGEST_OPTIMIZER_WIDTH = 384

/** next.config 의 images.remotePatterns 와 같은 목록 — 여기 없는 호스트는 최적화기가 거부한다 */
const OPTIMIZABLE_HOSTS = new Set(['kr.object.iwinv.kr', 'picsum.photos'])

/** 고해상도 화면 몫. 3배까지 올리면 40px 아바타가 128px 를 받는데 눈으로는 차이가 없다. */
const PIXEL_RATIO = 2

/**
 * @param boxWidth 화면에 그려지는 가장 큰 폭(CSS px)
 * @returns 최적화할 수 없는 주소(blob·data·목록에 없는 호스트)는 그대로 돌려준다
 */
export function optimizedImageUrl(src: string, boxWidth: number): string {
  let hostname: string
  try {
    hostname = new URL(src).hostname
  } catch {
    // 상대 경로 — 최적화 대상이 아니다
    return src
  }
  if (!OPTIMIZABLE_HOSTS.has(hostname)) return src
  const target = boxWidth * PIXEL_RATIO
  const width = OPTIMIZER_WIDTHS.find((candidate) => candidate >= target) ?? LARGEST_OPTIMIZER_WIDTH
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}
