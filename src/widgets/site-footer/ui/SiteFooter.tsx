'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/shared/ui'

const FOOTER_PATHS = new Set(['/', '/explore', '/community', '/hall-of-fame', '/faq'])

const SERVICE_LINKS = [
  { href: '/', label: '서비스 홈' },
  { href: '/explore', label: '탐색' },
  { href: '/hall-of-fame', label: '명예의 전당' },
  { href: '/faq', label: 'FAQ' },
] as const

const LEGAL_LINKS = [
  { href: 'https://pawpong.kr/terms-of-service', label: '이용약관' },
  { href: 'https://pawpong.kr/terms-of-privacy', label: '개인정보처리방침' },
] as const

/**
 * 공개 탐색 화면의 사이트 푸터.
 * 사업자 정보는 pawpong.kr에 현재 공개된 값만 사용하고, 계정·작성·채팅 흐름에는 노출하지 않는다.
 */
const SiteFooter = () => {
  const pathname = usePathname()

  if (!FOOTER_PATHS.has(pathname)) return null

  return (
    <footer className="border-t border-primary-100 bg-point-50">
      <Container className="py-8 tab:py-10 pc:py-12">
        <div className="flex flex-col gap-8 pc:flex-row pc:items-start pc:justify-between">
          <div className="flex max-w-md flex-col gap-3">
            <Link
              href="/"
              aria-label="Pawpong 서비스 홈"
              className="w-fit rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <Image src="/logo.svg" alt="Pawpong" width={108} height={36} className="h-9 w-auto" />
            </Link>
            <p className="text-sm leading-[1.6] font-medium text-neutral-700">
              신뢰할 수 있는 반려동물 입양과 브리더 상담을 연결합니다.
            </p>
          </div>

          <nav aria-label="푸터 서비스 메뉴" className="flex flex-wrap gap-x-5 gap-y-3">
            {SERVICE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded text-sm font-semibold text-neutral-700 transition-colors hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-primary-100 pt-6 tab:mt-10 tab:pt-8">
          <address className="flex flex-col gap-2 text-xs leading-[1.6] font-medium text-neutral-700 not-italic tab:text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>상호 콜딩(Colding)</span>
              <span>대표 김승찬</span>
              <span>사업자등록번호 457-49-00942</span>
            </div>
            <p>경기도 김포시 김포한강9로75번길 66, 5층 (구래동, 국제프라자)</p>
            <a
              href="mailto:coldingcontact@gmail.com"
              className="w-fit rounded transition-colors hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              coldingcontact@gmail.com
            </a>
          </address>

          <div className="mt-6 flex flex-col gap-3 border-t border-primary-100 pt-5 tab:flex-row tab:items-center tab:justify-between">
            <p className="text-xs font-medium text-neutral-500">
              Copyright © 2025 Pawpong Inc. All rights reserved.
            </p>
            <nav aria-label="법적 고지" className="flex flex-wrap gap-4">
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded text-xs font-semibold text-neutral-700 transition-colors hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export { SiteFooter }
