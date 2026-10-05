export type PetEnvironment = {
  appEnv?: string
  enabled?: string
  deploymentEnv?: string
  branch?: string
  hostname: string
}

/** NODE_ENV=production인 dev 빌드도 허용하되 운영 호스트/배포는 무조건 닫는다. */
export function isPetEnvironmentAllowed(env: PetEnvironment): boolean {
  const host = env.hostname.toLowerCase().replace(/:\d+$/, '')
  const allowedHost = ['dev.pawpong.kr', 'localhost', '127.0.0.1', '10.0.2.2', '[::1]'].includes(
    host,
  )
  return (
    env.appEnv === 'development' &&
    env.enabled === 'true' &&
    allowedHost &&
    env.deploymentEnv !== 'production' &&
    env.branch !== 'main' &&
    env.branch !== 'master'
  )
}
