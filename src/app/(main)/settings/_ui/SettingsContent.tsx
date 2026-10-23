'use client'

import { ChatPrivacySetting } from '@/features/chat-directory'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, CheckIcon, PixelArrowRightIcon } from '@/shared/assets'
import { profileQueries } from '@/entities/profile'
import { useDeleteAdopterAccount } from '@/features/adopter'
import { useLogoutAndRedirect } from '@/features/auth'
import { useDeleteBreederAccount } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/lib/useToast'
import { WithdrawReason } from '@/shared/types'
import { AlertMessage, Container, CtaModal, NavigationBar, ProfileAvatar } from '@/shared/ui'

interface SettingsContentProps {
  userRole: 'adopter' | 'breeder'
}

interface SettingsLink {
  href: string
  label: string
}

// 신청·후기는 두 역할 모두에게 보인다 (전체 메뉴·마이홈과 같음) — 입양자는 보낸 신청·후기,
// 브리더는 받은 신청·후기(와 예전에 보낸 기록)를 본다
const ACTIVITY_LINKS: SettingsLink[] = [
  { href: '/notifications', label: '알림센터' },
  { href: '/activity', label: '신청·후기 내역' },
]

// 웹은 푸터에 같은 링크가 있고, 푸터를 숨기는 앱에서만 이 묶음을 보여준다
const INFO_LINKS: SettingsLink[] = [
  { href: '/about', label: '서비스 소개' },
  { href: '/faq', label: '자주 묻는 질문' },
  { href: '/terms-of-service', label: '이용약관' },
  { href: '/terms-of-privacy', label: '개인정보처리방침' },
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

// 토스 설정처럼 글자 한 줄 + 오른쪽 화살표. 누르는 동안 옅은 회색이 깔린다 (hover 는 마우스 기기에서만)
const ROW =
  'flex min-h-14 w-full items-center gap-3 px-5 text-left focus-ring-inset transition-colors hover:bg-neutral-50 active:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50'

const RowArrow = () => (
  <PixelArrowRightIcon aria-hidden className="size-3 shrink-0 text-neutral-300" />
)

const SettingsRow = ({ href, label }: SettingsLink) => (
  <Link href={href} className={ROW}>
    <span className="min-w-0 flex-1 text-body-lg font-medium text-neutral-850">{label}</span>
    <RowArrow />
  </Link>
)

/**
 * 묶음 하나 — 모바일은 흰 바탕에 여백과 제목으로만 나누고, 2단(tab+)은 크림 바탕 위 둥근 흰 카드.
 * 묶음 제목은 포퐁 제목 글꼴(cafe24) 갈색으로 둔다.
 */
const SettingsGroup = ({
  title,
  className,
  children,
}: {
  title?: string
  className?: string
  children: ReactNode
}) => (
  <section className={cn('bg-white py-2 tab:overflow-hidden tab:rounded-2xl', className)}>
    {title && (
      <h2 className="px-5 pt-3 pb-1 font-cafe24 text-body-md text-primary-600 tab:text-body-lg">
        {title}
      </h2>
    )}
    {children}
  </section>
)

/** 맨 위 내 프로필 — 누르면 프로필 수정으로 간다 (토스 설정의 내 정보 카드) */
const ProfileSummary = ({ userRole }: SettingsContentProps) => {
  const { data: me } = useQuery({ ...profileQueries.me(), throwOnError: false })
  return (
    <section className="bg-white tab:overflow-hidden tab:rounded-2xl">
      <Link
        href="/profile/edit"
        className="flex items-center gap-4 px-5 py-5 focus-ring-inset transition-colors hover:bg-neutral-50 active:bg-neutral-100"
      >
        <ProfileAvatar size="large" src={me?.profileImageUrl} alt="" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-cafe24 text-body-xl text-neutral-850">
            {me?.nickname ?? '내 프로필'}
          </span>
          <span className="text-body-md font-medium text-neutral-700">
            {userRole === 'breeder' ? '브리더' : '입양자'} · 프로필 수정
          </span>
        </span>
        <RowArrow />
      </Link>
    </section>
  )
}

const SettingsContent = ({ userRole }: SettingsContentProps) => {
  const { logoutAndRedirect, isPending } = useLogoutAndRedirect()
  const toast = useToast()
  const [showLeave, setShowLeave] = useState(false)
  const isBreeder = userRole === 'breeder'
  const deleteAccount = useDeleteAdopterAccount()
  const deleteBreederAccount = useDeleteBreederAccount()
  const isLeavePending = deleteAccount.isPending || deleteBreederAccount.isPending

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
      toast.error(normalizeApiError(error, '탈퇴를 처리하지 못했어요.').message)
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-white tab:bg-secondary-50">
      <NavigationBar title="설정" backHref="/home" />

      {/* 모바일은 흰 바탕 꽉 찬 목록(묶음 사이는 여백만), tab+ 는 크림 바탕 위 가운데 한 줄 카드 */}
      <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-3 pb-16 tab:gap-4 tab:px-6 tab:pt-6">
        <ProfileSummary userRole={userRole} />

        <SettingsGroup title="알림·활동">
          {ACTIVITY_LINKS.map((item) => (
            <SettingsRow key={item.href} {...item} />
          ))}
        </SettingsGroup>

        <SettingsGroup title="공개 범위">
          <ChatPrivacySetting />
          <SettingsRow href="/account/content-rights" label="게시물 앱 표시 동의" />
        </SettingsGroup>

        <SettingsGroup title="정보" className="hidden in-data-app:block">
          {INFO_LINKS.map((item) => (
            <SettingsRow key={item.href} {...item} />
          ))}
        </SettingsGroup>

        <SettingsGroup>
          <button type="button" onClick={logoutAndRedirect} disabled={isPending} className={ROW}>
            <span className="text-body-lg font-medium text-neutral-850">
              {isPending ? '로그아웃하는 중…' : '로그아웃'}
            </span>
          </button>
        </SettingsGroup>

        {/* 자주 쓰지 않고 되돌리기 어려운 계정 정리는 목록 밖 작은 글자로 둔다 */}
        <div className="flex items-center justify-center gap-1 px-5 pt-1">
          <button
            type="button"
            onClick={() => setShowLeave(true)}
            disabled={isLeavePending}
            className="min-h-11 rounded px-3 text-body-sm font-medium text-neutral-700 underline-offset-4 focus-ring hover:underline disabled:opacity-50"
          >
            탈퇴하기
          </button>
          <span aria-hidden className="text-body-sm text-neutral-300">
            |
          </span>
          <Link
            href="/account/delete"
            className="flex min-h-11 items-center rounded px-3 text-body-sm font-medium text-neutral-700 underline-offset-4 focus-ring hover:underline"
          >
            계정 영구삭제
          </Link>
        </div>
      </div>

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
          { label: '계정 탈퇴', intent: 'secondary', onClick: handleLeave },
          { label: '다시 생각해볼게요', intent: 'primary', onClick: () => setShowLeave(false) },
        ]}
      />
    </div>
  )
}

export { SettingsContent }
