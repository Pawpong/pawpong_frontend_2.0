'use client'

import { useState, useRef, useEffect, type ChangeEvent, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { profileQueries } from '@/entities/profile'
import { useUpdateAdopterProfile, useDeleteAdopterAccount } from '@/features/adopter'
import { useUpdateBreederProfile } from '@/features/breeder'
import { useUpdateMyProfile } from '@/features/profile'
import { useUploadSingleFile } from '@/features/upload'
import { useLogout } from '@/features/auth'
import { WithdrawReason } from '@/shared/types'
import {
  AlertMessage,
  BottomSheet,
  Button,
  Container,
  CtaModal,
  NavigationBar,
  ProfileAvatar,
  InputField,
  Input,
  TextareaField,
} from '@/shared/ui'
import { CheckIcon } from '@/shared/assets/icons'
import { WithdrawReasonModal } from './WithdrawReasonModal'

// [refactored] 매직 넘버·문자열 상수화
const TOAST_DURATION_MS = 3000
const NAME_MAX_LENGTH = 30
const BIO_MAX_LENGTH = 100
const BELOW_PC_QUERY = '(max-width: 89.99rem)' // pc(1440px) 미만 = 모바일·탭

// [refactored] 아이콘·X 없는 반응형 확인 모달 프리셋 (적용/탈퇴 공용)
const ConfirmModal = (
  props: Omit<ComponentProps<typeof CtaModal>, 'icon' | 'showClose' | 'direction'>,
) => <CtaModal icon={null} showClose={false} direction="responsive-reverse" {...props} />

// [refactored] 탈퇴 모달 설명 — 줄바꿈 위치가 데스크탑/모바일·탭 다름
const LEAVE_DESCRIPTION = (
  <>
    <span className="block pc:hidden">
      계정 삭제 시 모든 개인정보가
      <br />
      삭제되며 복구되지 않습니다
    </span>
    <span className="hidden pc:block">
      계정 삭제시 모든 개인정보가 삭제되며
      <br />
      복구되지 않습니다
    </span>
  </>
)

// [refactored] 토스트 표시 + 자동 닫힘 로직 분리 (SRP)
const useToast = (duration = TOAST_DURATION_MS) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [visible, duration])

  return { visible, show: () => setVisible(true), hide: () => setVisible(false) }
}

/** 프로필 편집 (Figma node 2145-191107) — GNB는 MainLayout 제공 */
const ProfileEditContent = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [showReason, setShowReason] = useState(false) // 탈퇴 사유 선택 단계
  const [showLeave, setShowLeave] = useState(false) // 탈퇴 최종 확인 단계
  // 선택한 탈퇴 사유(확인 모달에서 실제 요청 시 사용)
  const [withdraw, setWithdraw] = useState<{ reason: WithdrawReason; otherReason?: string } | null>(
    null,
  )

  const toast = useToast() // [refactored]

  // 사진 선택 — pc는 바로 파일 선택, 모바일·탭은 바텀시트
  const [sheetOpen, setSheetOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadFile = useUploadSingleFile()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null) // 업로드 직후 미리보기(cdnUrl)
  const [photoFileName, setPhotoFileName] = useState<string | null>(null) // 저장용 파일명

  // 파일 선택 → 즉시 업로드 → 미리보기/저장값 보관
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 시에도 onChange 발생
    if (!file) return
    try {
      const res = await uploadFile.mutateAsync({ file, folder: 'profile' })
      setPhotoPreview(res.cdnUrl)
      setPhotoFileName(res.fileName)
    } catch {
      // TODO: 업로드 실패 토스트
    }
  }

  const openFilePicker = (capture: boolean) => {
    setSheetOpen(false)
    if (capture) fileInputRef.current?.setAttribute('capture', 'environment')
    else fileInputRef.current?.removeAttribute('capture')
    fileInputRef.current?.click()
  }

  const requestChange = () => {
    if (window.matchMedia(BELOW_PC_QUERY).matches) {
      setSheetOpen(true)
      return
    }
    openFilePicker(false)
  }

  // 역할 판별: /profile/me 는 입양자·브리더 공용 (nickname·bio·profileImageUrl·role 제공)
  const { data: myProfile } = useQuery(profileQueries.me())
  const isBreeder = myProfile?.role === 'breeder'

  // 활동명·이메일은 입양자 전용(/adopter/profile) — 브리더는 호출하지 않는다(조회 실패 방지)
  const { data: adopterProfile } = useQuery({
    ...adopterQueries.profile(),
    enabled: myProfile?.role === 'adopter',
  })

  // 조회값으로 폼 초기화 (최초 1회) — effect 대신 렌더 중 동기화(React 권장 패턴)
  // 브리더는 adopterProfile 을 기다리지 않고 myProfile(닉네임)로 시드한다
  const [seeded, setSeeded] = useState(false)
  const seedReady = isBreeder ? !!myProfile : !!(adopterProfile && myProfile)
  if (!seeded && seedReady) {
    setName((isBreeder ? myProfile?.nickname : adopterProfile?.nickname) ?? '')
    setBio(myProfile?.bio ?? '')
    setSeeded(true)
  }

  // 소셜 로그인 이메일은 입양자 프로필에만 있다 (브리더는 미표시)
  const email = adopterProfile?.emailAddress ?? ''

  const updateAdopterProfile = useUpdateAdopterProfile()
  const updateBreederProfile = useUpdateBreederProfile()
  const updateMyProfile = useUpdateMyProfile()
  const deleteAccount = useDeleteAdopterAccount()
  const logout = useLogout()

  // 사진 제외 모든 입력 필드가 채워져야 적용 가능 (소셜 로그인은 readOnly로 항상 채워짐)
  const isFormFilled = name.trim().length > 0 && bio.trim().length > 0
  const isSaving =
    updateAdopterProfile.isPending ||
    updateBreederProfile.isPending ||
    updateMyProfile.isPending ||
    uploadFile.isPending

  // 적용: 소개(bio)는 양쪽 공용 PATCH /profile/me.
  //  - 입양자: 활동명·사진 → PATCH /adopter/profile
  //  - 브리더: 사진 → PATCH /breeder-management/profile (활동명은 이 화면에서 미수정)
  const handleApply = async () => {
    setShowApply(false)
    try {
      const tasks: Promise<unknown>[] = [updateMyProfile.mutateAsync({ bio })]
      if (isBreeder) {
        if (photoFileName) {
          tasks.push(updateBreederProfile.mutateAsync({ profileImage: photoFileName }))
        }
      } else {
        tasks.push(
          updateAdopterProfile.mutateAsync({
            name,
            ...(photoFileName ? { profileImage: photoFileName } : {}),
          }),
        )
      }
      await Promise.all(tasks)
      toast.show()
    } catch {
      // TODO: 실패 토스트/에러 처리
    }
  }

  // 사유 선택 완료 → 최종 확인 모달로 전환
  const handleReasonNext = (reason: WithdrawReason, otherReason?: string) => {
    setWithdraw({ reason, otherReason })
    setShowReason(false)
    setShowLeave(true)
  }

  // 탈퇴: 사용자가 선택한 사유(+기타 상세)로 요청 — reason='other'면 otherReason 동반
  const handleLeave = async () => {
    if (!withdraw) return
    setShowLeave(false)
    try {
      await deleteAccount.mutateAsync({
        reason: withdraw.reason,
        ...(withdraw.otherReason ? { otherReason: withdraw.otherReason } : {}),
      })
      router.replace('/')
    } catch {
      // TODO: 실패 처리
    }
  }

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
      router.replace('/')
    } catch {
      // TODO: 실패 처리
    }
  }

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="프로필 편집" backHref="/home" />

      {/* 디자인: 모바일 px-16(margin-mo) / 탭+ px-80(margin-pc), py-48 */}
      <Container className="flex flex-col items-center gap-[2.625rem] px-4 py-12 tab:px-20">
        <div className="flex w-full max-w-[37.5rem] flex-col items-center gap-11">
          {/* 아바타 + 사진 변경 */}
          <div className="flex w-28 flex-col items-center gap-8">
            <ProfileAvatar
              size="xlarge"
              src={photoPreview ?? myProfile?.profileImageUrl}
            />
            <div className="flex w-full flex-col items-center gap-3">
              {/* TODO: 선택한 파일 업로드 연결 (onChange) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="fill" className="w-full" onClick={requestChange}>
                사진 변경
              </Button>
              <span className="text-base leading-[1.5] font-semibold text-[#3e3e3e]">
                기본 프로필
              </span>
            </div>
          </div>

          {/* 폼 */}
          <div className="flex w-full flex-col">
            <InputField label="포퐁 활동명">
              {/* 브리더 활동명(브리더명)은 이 화면에서 수정 불가 — 읽기전용 표시 */}
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX_LENGTH} // [refactored]
                placeholder="입력해보세요"
                readOnly={isBreeder}
                className={isBreeder ? 'cursor-default focus:border-[#e4e4e4]' : undefined}
              />
              {!isBreeder && (
                <p className="mt-1 self-end text-[0.625rem] leading-[1.5] font-medium text-[#6b6b6b]">
                  {name.length}/{NAME_MAX_LENGTH} {/* [refactored] */}
                </p>
              )}
            </InputField>

            <TextareaField
              label="소개"
              placeholder="입력해보세요"
              maxLength={BIO_MAX_LENGTH} // [refactored]
              currentLength={bio.length}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[6.5625rem]"
            />

            {/* 소셜 로그인 이메일은 입양자 프로필에만 있어 브리더에선 숨김 */}
            {!isBreeder && (
              <InputField label="소셜 로그인">
                {/* 표시 전용 — readOnly(수정X) + tabIndex/-1·focus 보더 중립화(focus X) */}
                <Input
                  value={email}
                  readOnly
                  className="cursor-default focus:border-[#e4e4e4]"
                />
              </InputField>
            )}
          </div>
        </div>

        {/* 탈퇴 / 로그아웃 — 로그아웃은 TODO 연결 */}
        <div className="flex items-center gap-10">
          {/* 탈퇴는 입양자 전용 API(useDeleteAdopterAccount) — 브리더에선 숨김 */}
          {!isBreeder && (
            <Button variant="text" onClick={() => setShowReason(true)}>
              탈퇴
            </Button>
          )}
          <Button variant="text" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </Container>

      {/* 하단 CTA — 디자인(1054-36832): 전체공개 드롭다운 없어도 바 높이 94px 유지
          모바일: 화면 맨 아래 고정 / 탭+: 일반 흐름 */}
      <div className="fixed inset-x-0 bottom-0 z-40 tab:relative tab:inset-auto tab:z-auto">
        {/* 적용 완료 토스트 — 버튼 바로 위 위치(레이아웃 안 밀림) + 풀 너비 */}
        {toast.visible && ( // [refactored]
          <Container className="absolute inset-x-0 bottom-[5rem]">
            <AlertMessage
              status="default"
              size="responsive"
              icon={CheckIcon}
              message="기본 프로필로 변경되었습니다"
              onClose={toast.hide} // [refactored]
            />
          </Container>
        )}

        {/* 모바일(1056-47239): 풀 너비·py-16·gap-10, 그만두기 고정 w-117 / 적용 flex-1, 둘 다 h-48
            탭+(1054-36832): 우측 정렬·바 높이 94px, 두 버튼 flex-1·h-32 */}
        <Container className="flex items-center bg-white py-4 tab:h-[5.875rem] tab:justify-end tab:py-0">
          <div className="flex w-full gap-2.5 tab:w-[22.5rem] tab:gap-5">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="w-[7.3125rem] tab:h-8 tab:w-auto tab:max-w-[16.125rem] tab:flex-1 tab:text-sm"
            >
              그만두기
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!isFormFilled || isSaving}
              onClick={() => setShowApply(true)}
              className="max-w-[18.5625rem] flex-1 tab:h-8 tab:max-w-[16.125rem] tab:text-sm"
            >
              프로필 적용
            </Button>
          </div>
        </Container>
      </div>

      {/* 사진 변경 바텀시트 — 모바일·탭 전용 (디자인 2147-196483) */}
      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="사진변경"
        actions={[
          { label: '사진첩 보기', onClick: () => openFilePicker(false) },
          { label: '촬영하기', onClick: () => openFilePicker(true) },
        ]}
      />

      {/* 프로필 적용 확인 (디자인 2145-192876 / 모바일·탭 2145-192877) */}
      <ConfirmModal
        open={showApply}
        onOpenChange={setShowApply}
        title="프로필을 적용하시겠습니까?"
        actions={[
          { label: '취소', variant: 'outline', onClick: () => setShowApply(false) },
          { label: '적용하기', variant: 'fill', onClick: handleApply },
        ]}
      />

      {/* 탈퇴 사유 선택 (확인 모달 앞 단계) — 선택 완료 시 최종 확인 모달로 전환 */}
      <WithdrawReasonModal open={showReason} onOpenChange={setShowReason} onNext={handleReasonNext} />

      {/* 계정 탈퇴 확인 (디자인 2145-193207 / 모바일·탭 2145-193342) */}
      <ConfirmModal
        open={showLeave}
        onOpenChange={setShowLeave}
        title="포퐁을 떠나실 건가요?"
        description={LEAVE_DESCRIPTION} // [refactored]
        actions={[
          { label: '계정 탈퇴', variant: 'outline', onClick: handleLeave },
          { label: '다시 생각해볼게요', variant: 'fill', onClick: () => setShowLeave(false) },
        ]}
      />
    </div>
  )
}

export { ProfileEditContent }
