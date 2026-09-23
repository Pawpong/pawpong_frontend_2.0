/** 오래 열린 웹뷰가 이전 배포의 JS/CSS 파일을 요청하면 React reset만으로 복구되지 않는다. */
export function needsDocumentReload(error: Pick<Error, 'name' | 'message'>): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    /Loading (?:CSS )?chunk .+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      error.message,
    )
  )
}

/** 사용자가 재시도를 눌렀을 때만 새 문서를 받아 작성 중인 화면의 자동 재시작을 피한다. */
export function recoverPageError(
  error: Pick<Error, 'name' | 'message'>,
  reset: () => void,
  reload: () => void,
): void {
  if (needsDocumentReload(error)) reload()
  else reset()
}
