'use client'

import type { ReactNode } from 'react'
import { Container } from './Container'
import { Button } from './Button'

interface FooterCtaAction {
  label: string
  onClick: () => void
  disabled?: boolean
}

interface FooterCtaBarProps {
  /** 좌측 슬롯 (예: 공개범위 드롭다운) — tab+ 에서만 노출 */
  leftSlot?: ReactNode
  /** 보조 버튼 (그만두기 / 임시저장 등) — 없으면 주 버튼만 노출 */
  secondary?: FooterCtaAction
  /** 주 버튼 (프로필 적용 / 업로드 등) */
  primary: FooterCtaAction
  /** 바 위에 겹쳐 띄우는 요소 (예: 완료 토스트) */
  children?: ReactNode
}

/**
 * 화면 하단 고정 CTA 바 (Figma 1054-36832 / 모바일 1056-47239).
 * - 바: 높이 94(tab+), 좌우 여백은 Container 기본(mo16 / tab48 / pc80)
 * - 버튼: 모바일 h-48 풀 너비(보조 117 고정), tab+ h-40 · 170 · gap 20 (그룹 360)
 */
const FooterCtaBar = ({ leftSlot, secondary, primary, children }: FooterCtaBarProps) => (
  <div className="fixed inset-x-0 bottom-0 z-sticky bg-white">
    {children}

    <Container className="flex items-center bg-white py-4 tab:h-[5.875rem] tab:justify-between tab:py-0">
      {/* 좌측 슬롯 자리는 비어 있어도 유지해 버튼 그룹이 우측에 붙게 한다 */}
      <div className="hidden tab:block">{leftSlot}</div>

      {/* 그룹 폭 360은 [보조+주] 2개 기준(170+20+170). 주 버튼만 있을 땐 남는 190만큼
          왼쪽으로 뜨므로 오른쪽으로 붙인다 (2개일 땐 딱 맞아 영향 없음) */}
      <div className="flex w-full gap-2.5 tab:w-[22.5rem] tab:justify-end tab:gap-5">
        {secondary && (
          <Button
            variant="outline"
            size="lg"
            onClick={secondary.onClick}
            disabled={secondary.disabled}
            className="w-[7.3125rem] shrink-0 tab:h-10 tab:w-auto tab:max-w-[10.625rem] tab:flex-1"
          >
            {secondary.label}
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          onClick={primary.onClick}
          disabled={primary.disabled}
          className="max-w-[18.5625rem] flex-1 tab:h-10 tab:max-w-[10.625rem]"
        >
          {primary.label}
        </Button>
      </div>
    </Container>
  </div>
)

export { FooterCtaBar, type FooterCtaAction }
