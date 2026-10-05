import 'server-only'
import { isPetEnvironmentAllowed } from './environment'

export function isPetServerEnabled(hostname: string): boolean {
  return isPetEnvironmentAllowed({
    appEnv: process.env.APP_ENV,
    enabled: process.env.PLAYGROUND_PET_ENABLED,
    deploymentEnv: process.env.VERCEL_ENV,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
    hostname,
  })
}
