'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/assets'
import { useLogoutAndRedirect } from '@/features/auth'
import { Container, NavigationBar } from '@/shared/ui'

interface SettingsContentProps {
  userRole: 'adopter' | 'breeder'
}

interface SettingsLink {
  href: string
  label: string
  description: string
}

const COMMON_LINKS: SettingsLink[] = [
  {
    href: '/profile/edit',
    label: '프로필 수정',
    description: '닉네임, 소개와 프로필 사진을 관리해요.',
  },
  {
    href: '/notifications',
    label: '알림',
    description: '새 소식과 읽지 않은 알림을 확인해요.',
  },
  {
    href: '/bookmarks',
    label: '저장목록',
    description: '관심 동물과 저장한 게시글을 모아봐요.',
  },
]

const BREEDER_LINKS: SettingsLink[] = [
  {
    href: '/adoption/my-listings',
    label: '분양글 관리',
    description: '작성한 분양글과 진행 상태를 관리해요.',
  },
]

const ADOPTER_LINKS: SettingsLink[] = [
  {
    href: '/activity',
    label: '신청·후기 내역',
    description: '보낸 입양 신청의 진행 상태와 작성한 후기를 확인해요.',
  },
]

const SettingsLinkRow = ({ href, label, description }: SettingsLink) => (
  <Link
    href={href}
    className="group flex min-h-18 items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-primary-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 tab:px-5"
  >
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="text-sm font-semibold text-neutral-850 tab:text-base">{label}</span>
      <span className="text-xs leading-[1.5] font-medium text-neutral-500 tab:text-sm">
        {description}
      </span>
    </span>
    <ArrowRightIcon className="size-5 shrink-0 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
  </Link>
)

const SettingsContent = ({ userRole }: SettingsContentProps) => {
  const { logoutAndRedirect, isPending } = useLogoutAndRedirect()
  const links =
    userRole === 'breeder'
      ? [...COMMON_LINKS, ...BREEDER_LINKS]
      : [...COMMON_LINKS, ...ADOPTER_LINKS]

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar title="설정" backHref="/home" />

      <Container className="py-5 tab:py-8 pc:py-10">
        <div className="mx-auto flex w-full max-w-168 flex-col gap-5 pc:max-w-[59.25rem]">
          <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
            <h2 className="px-4 pt-4 pb-2 font-cafe24 text-sm text-primary-600 tab:px-5 tab:text-base">
              내 정보
            </h2>
            <div className="divide-y divide-neutral-150">
              {links.map((item) => (
                <SettingsLinkRow key={item.href} {...item} />
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
            <h2 className="px-4 pt-4 pb-2 font-cafe24 text-sm text-primary-600 tab:px-5 tab:text-base">
              계정
            </h2>
            <button
              type="button"
              onClick={logoutAndRedirect}
              disabled={isPending}
              className="flex min-h-18 w-full flex-col items-start justify-center gap-0.5 px-4 py-3 text-left transition-colors hover:bg-error-50/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50 tab:px-5"
            >
              <span className="text-sm font-semibold text-error-600 tab:text-base">
                {isPending ? '로그아웃하는 중' : '로그아웃'}
              </span>
              <span className="text-xs leading-[1.5] font-medium text-neutral-500 tab:text-sm">
                이 기기의 포퐁 계정에서 로그아웃해요.
              </span>
            </button>
          </section>
        </div>
      </Container>
    </div>
  )
}

export { SettingsContent }
