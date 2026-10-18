export function sessionImageSource(src: string, scope: string): string {
  const url = new URL(src, 'https://local.invalid')
  url.searchParams.set('_session', scope)
  return `${url.pathname}${url.search}${url.hash}`
}

export const isSessionImageSource = (src: unknown): src is string =>
  typeof src === 'string' && src.startsWith('/api/')
