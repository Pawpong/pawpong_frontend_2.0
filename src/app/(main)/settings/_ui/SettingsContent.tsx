'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircleIcon, ArrowRightIcon, CheckIcon } from '@/shared/assets'
import { useDeleteAdopterAccount } from '@/features/adopter'
import { useLogoutAndRedirect } from '@/features/auth'
import { useDeleteBreederAccount } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { useToast } from '@/shared/lib/useToast'
import { WithdrawReason } from '@/shared/types'
import { AlertMessage, Container, CtaModal, NavigationBar } from '@/shared/ui'

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
    href: '/account/content-rights',
    label: '게시물 앱 표시 동의',
    description: '내 사진과 게시물을 포퐁 앱에도 표시할지 선택해요.',
  },
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
]

const ADOPTER_LINKS: SettingsLink[] = [
  {
    href: '/activity',
    label: '신청·후기 내역',
    description: '보낸 입양 신청의 진행 상태와 작성한 후기를 확인해요.',
  },
]

// 기존 탈퇴는 복구 가능한 이용 중지다. 영구삭제는 별도 경로에서 명시적으로 요청한다.
const LEAVE_DESCRIPTION = (
  <>
    계정 이용을 중지하고 로그아웃해요.
    <br />
    이후 소셜 로그인으로 복구할 수 있으며,
    <br />
    개인정보 영구삭제는 별도로 요청할 수 있어요.
  </>
)

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
  const toast = useToast()
  const [showLeave, setShowLeave] = useState(false)
  const isBreeder = userRole === 'breeder'
  const deleteAccount = useDeleteAdopterAccount()
  const deleteBreederAccount = useDeleteBreederAccount()
  const isLeavePending = deleteAccount.isPending || deleteBreederAccount.isPending
  // 브리더는 공통 메뉴만, 입양자는 신청·후기 내역이 더해진다
  const links = userRole === 'breeder' ? COMMON_LINKS : [...COMMON_LINKS, ...ADOPTER_LINKS]

  // 탈퇴: 사유를 묻지 않고 바로 요청 — 프로필 편집의 탈퇴와 같은 정책(API가 reason을 필수로 받아 'other'로 보낸다)
  // 탈퇴 성공 뒤에는 반드시 세션을 끊는다 (프로필 편집과 같은 이유 — 남은 쿠키로 로그인된 것처럼 보이는 것 방지)
  const handleLeave = async () => {
    setShowLeave(false)
    try {
      if (isBreeder) {
        await deleteBreederAccount.mutateAsync({ reason: 'other' })
      } else {
        await deleteAccount.mutateAsync({ reason: WithdrawReason.OTHER })
      }
      logoutAndRedirect()
    } catch (error) {
      toast.error(normalizeApiError(error, '탈퇴 처리에 실패했습니다.').message)
    }
  }

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
            <div className="border-t border-neutral-150">
              <button
                type="button"
                onClick={() => setShowLeave(true)}
                disabled={isLeavePending}
                className="flex min-h-18 w-full flex-col items-start justify-center gap-0.5 px-4 py-3 text-left transition-colors hover:bg-error-50/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50 tab:px-5"
              >
                <span className="text-sm font-semibold text-error-600 tab:text-base">탈퇴</span>
                <span className="text-xs leading-[1.5] font-medium text-neutral-500 tab:text-sm">
                  계정 이용을 중지해요. 소셜 로그인으로 복구할 수 있어요.
                </span>
              </button>
            </div>
            <div className="border-t border-neutral-150">
              <SettingsLinkRow
                href="/account/delete"
                label="계정 영구삭제"
                description="계정과 연결된 데이터를 삭제해요. 영구삭제 후에는 복구할 수 없어요."
              />
            </div>
          </section>
        </div>
      </Container>

      {toast.current && (
        <Container className="fixed inset-x-0 bottom-4 z-header">
          <AlertMessage
            status={toast.current.status}
            size="responsive"
            icon={toast.current.status === 'error' ? AlertCircleIcon : CheckIcon}
            message={toast.current.message}
            onClose={toast.hide}
          />
        </Container>
      )}

      {/* 계정 탈퇴 확인 (디자인 2145-193207 / 모바일·탭 2145-193342) — 프로필 편집과 같은 모달 */}
      <CtaModal
        open={showLeave}
        onOpenChange={setShowLeave}
        icon={null}
        showClose={false}
        direction="responsive-reverse"
        title="포퐁을 떠나실 건가요?"
        description={LEAVE_DESCRIPTION}
        actions={[
          { label: '계정 탈퇴', variant: 'outline', onClick: handleLeave },
          { label: '다시 생각해볼게요', variant: 'fill', onClick: () => setShowLeave(false) },
        ]}
      />
    </div>
  )
}

export { SettingsContent }
