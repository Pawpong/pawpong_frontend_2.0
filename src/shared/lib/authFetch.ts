/** WebView가 오프라인이어도 인증 작업과 쿠키 변경 잠금이 끝없이 대기하지 않게 한다. */
export async function authFetch<T>(
  path: string,
  options: RequestInit,
  readResponse: (response: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(path, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
    })
    return await readResponse(response)
  } finally {
    clearTimeout(timeout)
  }
}
