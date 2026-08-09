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
import { normalizeApiError } from '@/shared/api'
import { WithdrawReason } from '@/shared/types'
import {
  AlertMessage,
  BottomSheet,
  Button,
  Container,
  CtaModal,
  FooterCtaBar,
  NavigationBar,
  ProfileAvatar,
  InputField,
  Input,
  TextareaField,
} from '@/shared/ui'
import { AlertCircleIcon, CheckIcon } from '@/shared/assets/icons'

// [refactored] 매직 넘버·문자열 상수화
const TOAST_DURATION_MS = 3000
const NAME_MAX_LENGTH = 30
const BIO_MAX_LENGTH = 100
const BELOW_PC_QUERY = '(max-width: 89.99rem)' // pc(1440px) 미만 = 모바일·탭

// [refactored] 아이콘·X 없는 반응형 확인 모달 프리셋 (적용/탈퇴 공용)
const ConfirmModal = (
  props: Omit<ComponentProps<typeof CtaModal>, 'icon' | 'showClose' | 'direction'>,
) => <CtaModal icon={null} showClose={false} direction="responsive-reverse" {...props} />

// 탈퇴 모달 설명 (Figma 2145-193207) — 모바일·탭·PC 모두 같은 문구·줄바꿈
const LEAVE_DESCRIPTION = (
  <>
    계정 삭제시 모든 개인정보가 삭제되며
    <br />
    복구되지 않습니다
  </>
)

// [refactored] 토스트 표시 + 자동 닫힘 로직 분리 (SRP)
// 성공(default)·실패(error) 두 종류를 같은 슬롯에서 표시한다.
type ToastState = { message: string; status: 'default' | 'error' }

const useToast = (duration = TOAST_DURATION_MS) => {
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), duration)
    return () => clearTimeout(timer)
  }, [toast, duration])

  return {
    current: toast,
    success: (message: string) => setToast({ message, status: 'default' }),
    error: (message: string) => setToast({ message, status: 'error' }),
    hide: () => setToast(null),
  }
}

/** 프로필 편집 (Figma node 2145-191107) — GNB는 MainLayout 제공 */
const ProfileEditContent = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [showLeave, setShowLeave] = useState(false) // 탈퇴 확인 모달

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
    } catch (error) {
      toast.error(normalizeApiError(error, '사진 업로드에 실패했습니다.').message)
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
      toast.success('프로필이 변경되었습니다')
    } catch (error) {
      toast.error(normalizeApiError(error, '프로필 적용에 실패했습니다.').message)
    }
  }

  // 탈퇴: 사유를 묻지 않고 바로 요청 — API 가 reason 을 필수로 받아 'other' 로 보낸다
  const handleLeave = async () => {
    setShowLeave(false)
    try {
      await deleteAccount.mutateAsync({ reason: WithdrawReason.OTHER })
      router.replace('/')
    } catch (error) {
      toast.error(normalizeApiError(error, '탈퇴 처리에 실패했습니다.').message)
    }
  }

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
      router.replace('/')
    } catch (error) {
      toast.error(normalizeApiError(error, '로그아웃에 실패했습니다.').message)
    }
  }

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="프로필 편집" backHref="/home" />

      {/* 디자인: 모바일 px-16(margin-mo) / 탭+ px-80(margin-pc), py-48
          하단 CTA 바가 고정이라 그 높이(94px)만큼 아래 여백을 둔다 */}
      <Container className="flex flex-col items-center gap-[2.625rem] px-4 pt-12 pb-[7.5rem] tab:px-20">
        <div className="flex w-full max-w-[37.5rem] flex-col items-center gap-11">
          {/* 아바타 + 사진 변경 */}
          <div className="flex w-28 flex-col items-center gap-8">
            <ProfileAvatar size="xlarge" src={photoPreview ?? myProfile?.profileImageUrl} />
            <div className="flex w-full flex-col items-center gap-3">
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
              <span className="text-base leading-[1.5] font-semibold text-neutral-850">
                기본 프로필
              </span>
            </div>
          </div>

          {/* 폼 — 항목 사이 8px (앞 항목 카운터 밑 ~ 다음 항목 라벨 위) */}
          <div className="flex w-full flex-col gap-2">
            <InputField label="포퐁 활동명">
              {/* 브리더 활동명(브리더명)은 이 화면에서 수정 불가 — 읽기전용 표시 */}
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX_LENGTH} // [refactored]
                placeholder="입력해보세요"
                readOnly={isBreeder}
                className={isBreeder ? 'cursor-default focus:border-neutral-150' : undefined}
              />
              {!isBreeder && (
                <p className="mt-1 self-end text-[0.625rem] leading-[1.5] font-medium text-neutral-700">
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
                <Input value={email} readOnly className="cursor-default focus:border-neutral-150" />
              </InputField>
            )}
          </div>
        </div>

        {/* 탈퇴 / 로그아웃 */}
        <div className="flex items-center gap-10">
          {/* 탈퇴는 입양자 전용 API(useDeleteAdopterAccount) — 브리더에선 숨김 */}
          {!isBreeder && (
            <Button variant="text" onClick={() => setShowLeave(true)}>
              탈퇴
            </Button>
          )}
          <Button variant="text" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </Container>

      {/* 하단 고정 CTA — 공통 FooterCtaBar (Figma 1054-36832 / 모바일 1056-47239) */}
      <FooterCtaBar
        secondary={{ label: '그만두기', onClick: () => router.back() }}
        primary={{
          label: '프로필 적용',
          onClick: () => setShowApply(true),
          disabled: !isFormFilled || isSaving,
        }}
      >
        {/* 적용 완료·실패 토스트 — 버튼 바로 위 위치(레이아웃 안 밀림) + 풀 너비 */}
        {toast.current && ( // [refactored]
          <Container className="absolute inset-x-0 bottom-[5rem]">
            <AlertMessage
              status={toast.current.status}
              size="responsive"
              icon={toast.current.status === 'error' ? AlertCircleIcon : CheckIcon}
              message={toast.current.message}
              onClose={toast.hide} // [refactored]
            />
          </Container>
        )}
      </FooterCtaBar>

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
