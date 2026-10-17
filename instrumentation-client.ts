import * as Sentry from '@sentry/nextjs'
import { sentryEnvironmentOptions } from './sentry.environment'
import { isBrowserExtensionOnlyError } from './sentry.browser'

const options = sentryEnvironmentOptions()
if (options.enabled)
  Sentry.init({
    ...options,
    beforeSend(event, hint) {
      if (isBrowserExtensionOnlyError(event, hint)) return null
      return options.beforeSend(event)
    },
  })

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
