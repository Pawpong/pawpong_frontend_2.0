/** 움직임 줄이기 설정이면 섞기·튀기 연출을 기다리지 않고 바로 다음 화면으로 넘긴다. */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}
