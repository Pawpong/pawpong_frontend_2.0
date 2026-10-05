export type PetEnvironment = {
  appEnv?: string
  enabled?: string
  deploymentEnv?: string
  branch?: string
  hostname: string
}

export type PetExposureMode = 'development' | 'public'

/** 조회 가능한 환경만 판별한다. 운영 공개 여부는 서버의 관리자 승인 config가 결정한다. */
export function petExposureMode(env: PetEnvironment): PetExposureMode | null {
  const host = env.hostname.toLowerCase().replace(/:\d+$/, '')
  const allowedHost = ['dev.pawpong.kr', 'localhost', '127.0.0.1', '10.0.2.2', '[::1]'].includes(
    host,
  )
  if (
    env.appEnv === 'development' &&
    env.enabled === 'true' &&
    allowedHost &&
    env.deploymentEnv !== 'production' &&
    env.branch !== 'main' &&
    env.branch !== 'master'
  )
    return 'development'
  if (
    ['pawpong.kr', 'www.pawpong.kr'].includes(host) &&
    env.deploymentEnv === 'production' &&
    env.branch === 'main' &&
    env.appEnv !== 'development'
  )
    return 'public'
  return null
}

export function isPetEnvironmentAllowed(env: PetEnvironment): boolean {
  return petExposureMode(env) !== null
}
