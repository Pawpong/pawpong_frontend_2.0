'use client'

import { useEffect } from 'react'
import { PAWPONG_MAKERS } from '@/shared/config/makers'

const COLDING_ART = [
  ['   ██████   ██████   ██       ██████   ██  ███    ██   ██████', '#e0f2fe'],
  ['  ██       ██    ██  ██       ██   ██  ██  ████   ██  ██', '#bae6fd'],
  ['  ██       ██    ██  ██       ██   ██  ██  ██ ██  ██  ██   ███', '#7dd3fc'],
  ['  ██       ██    ██  ██       ██   ██  ██  ██  ██ ██  ██    ██', '#7dd3fc'],
  ['   ██████   ██████   ███████  ██████   ██  ██   ████   ██████', '#38bdf8'],
  ['     ▀█        █▀       █       ▀█     █▀         █      ▀█', '#0ea5e9'],
  ['      ▀        ▀        ▀        ▀     ▀          ▀       ▀', '#0284c7'],
  ['                        ·                         ·', '#64748b'],
] as const

declare global {
  interface Window {
    __pawpongMakersLogged?: boolean
  }
}

export function MakerCreditConsole() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'test' || window.__pawpongMakersLogged) return
    // Strict Mode 재실행, 화면 이동, 개발 중 모듈 갱신에도 문서마다 한 번만 출력한다.
    window.__pawpongMakersLogged = true
    const team = PAWPONG_MAKERS.map(
      ({ name, github, site }) =>
        `${name} (${github}) ${site ? `${site} · ` : ''}https://github.com/${github}`,
    ).join('\n')
    // 운영 로그 제거 정책을 유지하면서 이 제작자 안내만 남기기 위해 간접 참조한다.
    const print: typeof console.log = Function.prototype.bind.call(console.log, console)
    print(
      `${COLDING_ART.map(([line]) => `%c${line}`).join('\n')}%c\n\n%c🧊 Made by COLDING%c\n이 서비스를 만든 사람들\n${team}\n\n%c함께 일하고 싶거나 궁금한 게 있다면 → https://kscold.com/info`,
      ...COLDING_ART.map(
        ([, color]) => `color:${color};font-family:Menlo,monospace;font-size:10px;line-height:1`,
      ),
      '',
      'color:#38bdf8;font-weight:bold;font-size:14px',
      '',
      'color:#7dd3fc;font-size:12px',
    )
  }, [])

  return null
}
