import * as Sentry from '@sentry/nextjs'
import { sentryEnvironmentOptions } from './sentry.environment'

const options = sentryEnvironmentOptions()
if (options.enabled) Sentry.init(options)

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
