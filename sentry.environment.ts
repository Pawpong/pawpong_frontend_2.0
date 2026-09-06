/** 로컬·프리뷰는 운영 DSN을 재사용하지 않는다. */
export function resolveSentryEnvironment(input: {
  environment?: string
  nodeEnv?: string
  hostname?: string
  productionDsn?: string
  developmentDsn?: string
  enableDevelopment?: string
}) {
  const local =
    input.hostname !== undefined && !['pawpong.kr', 'www.pawpong.kr'].includes(input.hostname)
  const environment =
    input.nodeEnv !== 'production' || local ? 'development' : input.environment || 'development'
  const production = environment === 'production'
  const dsn = production ? input.productionDsn : input.developmentDsn
  const enabled = Boolean(
    dsn && (production || (input.enableDevelopment === 'true' && dsn !== input.productionDsn)),
  )
  return { environment, dsn: enabled ? dsn : undefined, enabled }
}

export function sentryEnvironmentOptions() {
  return {
    ...resolveSentryEnvironment({
      environment: process.env.NEXT_PUBLIC_APP_ENV,
      nodeEnv: process.env.NODE_ENV,
      hostname: typeof window === 'undefined' ? undefined : window.location.hostname,
      productionDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      developmentDsn: process.env.NEXT_PUBLIC_SENTRY_DEV_DSN,
      enableDevelopment: process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV,
    }),
    beforeSend: createErrorBudget(),
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    enableLogs: false,
    sendDefaultPii: false,
  }
}

/** 같은 실행 환경의 오류 폭주를 제한함. 전역 월간 한도를 대체하지는 않음. */
export function createErrorBudget(now = () => Date.now()) {
  let windowStart = now()
  let sent = 0
  const recent = new Map<string, number>()
  return <
    T extends { message?: string; exception?: { values?: { type?: string; value?: string }[] } },
  >(
    event: T,
  ): T | null => {
    const time = now()
    if (time - windowStart >= 60_000) {
      windowStart = time
      sent = 0
      recent.clear()
    }
    const key = JSON.stringify(
      event.exception?.values?.map(({ type, value }) => [type, value]) ||
        event.message ||
        'unknown',
    )
    if (sent >= 20 || recent.has(key)) return null
    recent.set(key, time)
    sent += 1
    return event
  }
}
