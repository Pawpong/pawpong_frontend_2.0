export function isDevelopmentCommunityHost(hostHeader: string | null): boolean {
  const host = (hostHeader ?? '').split(':')[0].toLowerCase()
  return (
    host === 'dev.pawpong.kr' ||
    (['localhost', '127.0.0.1'].includes(host) && process.env.NEXT_PUBLIC_APP_ENV === 'development')
  )
}
