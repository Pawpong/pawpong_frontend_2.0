import os from 'node:os'
import path from 'node:path'
import { request, type FullConfig } from '@playwright/test'

/** Vercel 배포 보호를 넘는 쿠키를 담아 두는 파일 — playwright.config 의 storageState */
export const BYPASS_STATE = path.join(os.tmpdir(), 'pawpong-e2e-bypass.json')

// 배포 보호 우회 헤더를 모든 요청에 붙이면 API(다른 출처) 요청에도 붙어, 백엔드 CORS 가 허용하지 않는 헤더라 데이터를 못 받는다.
// 그래서 시작 전에 한 번만 보내 배포 도메인에 우회 쿠키를 받아 두고, 테스트는 그 쿠키로 연다.
const globalSetup = async (config: FullConfig) => {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (!secret) return
  const context = await request.newContext({
    baseURL: config.projects[0].use.baseURL,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': secret,
      'x-vercel-set-bypass-cookie': 'true',
    },
  })
  await context.get('/')
  await context.storageState({ path: BYPASS_STATE })
  await context.dispose()
}

export default globalSetup
