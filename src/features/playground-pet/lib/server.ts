import 'server-only'
import type { PetConfig } from '@/entities/playground-pet/model/types'
import { petExposureMode } from './environment'

export async function getPetServerConfig(
  hostname: string,
): Promise<{ config: PetConfig; unavailable: boolean }> {
  const mode = petExposureMode({
    appEnv: process.env.APP_ENV,
    enabled: process.env.PLAYGROUND_PET_ENABLED,
    deploymentEnv: process.env.VERCEL_ENV,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
    hostname,
  })
  const disabled = { config: { enabled: false }, unavailable: false }
  if (!mode) return disabled
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) return disabled
  try {
    const response = await fetch(`${base.replace(/\/+$/, '')}/api/v2/playground/pet/config`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (response.status === 404) return disabled
    if (!response.ok) return { ...disabled, unavailable: true }
    const body = await response.json()
    const publicEnabled = body.success === true && body.data?.publicEnabled === true
    return {
      config: {
        enabled:
          body.success === true &&
          body.data?.enabled === true &&
          (mode === 'development' || publicEnabled),
        publicEnabled,
        ...(typeof body.data?.policyVersion === 'string' && {
          policyVersion: body.data.policyVersion,
        }),
      },
      unavailable: false,
    }
  } catch {
    return { ...disabled, unavailable: true }
  }
}

/** 직접 페이지도 같은 관리자 gate를 조회한다. config 오류나 비공개에는 화면을 내보내지 않는다. */
export async function isPetServerEnabled(hostname: string): Promise<boolean> {
  return (await getPetServerConfig(hostname)).config.enabled
}
