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

const TOAST_DURATION_MS = 3000
const NAME_MAX_LENGTH = 30
const BIO_MAX_LENGTH = 200 // 서버 UpdateMyProfileRequestDto.bio maxLength

// [refactored] 표시 전용 Input 스타일 — 수정 불가(readOnly) + focus 보더 중립화
const READONLY_INPUT_CLASS = 'cursor-default focus:border-neutral-150'

// 아이콘·X 없는 반응형 확인 모달 프리셋 (적용/탈퇴 공용)
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

// 토스트 표시 + 자동 닫힘 로직 분리 (SRP)
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

  const toast = useToast()
  // [refactored] 서버 메시지 우선, 없으면 fallback — 4개 catch 블록의 반복 제거
  const showError = (error: unknown, fallback: string) =>
    toast.error(normalizeApiError(error, fallback).message)

  // 사진 선택 — OS 기본 시트(사진 보관함·촬영·파일)에 맡긴다.
  // 갤러리만 여는 웹 표준 속성이 없어 자체 바텀시트를 두면 선택지를 두 번 묻게 된다.
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
      showError(error, '사진 업로드에 실패했습니다.') // [refactored]
    }
  }

  // 역할 판별: /profile/me 는 입양자·브리더 공용 (nickname·bio·profileImageUrl·role 제공)
  const { data: myProfile } = useQuery(profileQueries.me())
  const isBreeder = myProfile?.role === 'breeder'

  // 활동명·이메일은 입양자 전용(/adopter/profile) — 브리더는 호출하지 않는다(조회 실패 방지)
  const { data: adopterProfile } = useQuery({
    ...adopterQueries.profile(),
    enabled: myProfile?.role === 'adopter',
  })

  // 서버 원본값 — 폼 시드와 변경 감지(isDirty)의 기준. 저장 후 쿼리가 갱신되면 같이 따라간다
  const savedName = (isBreeder ? myProfile?.nickname : adopterProfile?.nickname) ?? ''
  const savedBio = myProfile?.bio ?? ''

  // 조회값으로 폼 초기화 (최초 1회) — effect 대신 렌더 중 동기화(React 권장 패턴)
  // 브리더는 adopterProfile 을 기다리지 않고 myProfile(닉네임)로 시드한다
  const [seeded, setSeeded] = useState(false)
  const seedReady = isBreeder ? !!myProfile : !!(adopterProfile && myProfile)
  if (!seeded && seedReady) {
    setName(savedName)
    setBio(savedBio)
    setSeeded(true)
  }

  // 소셜 로그인 이메일은 입양자 프로필에만 있다 (브리더는 미표시)
  const email = adopterProfile?.emailAddress ?? ''

  const updateAdopterProfile = useUpdateAdopterProfile()
  const updateBreederProfile = useUpdateBreederProfile()
  const updateMyProfile = useUpdateMyProfile()
  const deleteAccount = useDeleteAdopterAccount()
  const logout = useLogout()

  // 활동명만 필수. 소개는 서버 스펙상 빈 문자열이 "소개 비우기"로 허용돼 막지 않는다.
  // 브리더 활동명은 이 화면에서 readOnly라 검사에서 제외 — 비어 있어도 저장을 막으면 손쓸 방법이 없다
  const isFormFilled = isBreeder || name.trim().length > 0
  // 바뀐 게 없으면 적용할 것도 없다. 저장 성공 시 쿼리 갱신으로 savedName/savedBio 가 따라와 자동으로 false
  const isDirty = name !== savedName || bio !== savedBio || !!photoFileName
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
      const tasks: Promise<unknown>[] = []
      if (bio !== savedBio) {
        tasks.push(updateMyProfile.mutateAsync({ bio }))
      }
      if (isBreeder) {
        if (photoFileName) {
          tasks.push(updateBreederProfile.mutateAsync({ profileImage: photoFileName }))
        }
      } else if (name !== savedName || photoFileName) {
        tasks.push(
          updateAdopterProfile.mutateAsync({
            name,
            ...(photoFileName ? { profileImage: photoFileName } : {}),
          }),
        )
      }
      await Promise.all(tasks)
      // 각 mutation 이 최신 프로필 refetch까지 기다리므로 서버 이미지로 안전하게 전환할 수 있다.
      setPhotoFileName(null)
      setPhotoPreview(null)
      toast.success('프로필이 변경되었습니다')
    } catch (error) {
      showError(error, '프로필 적용에 실패했습니다.') // [refactored]
    }
  }

  // 탈퇴: 사유를 묻지 않고 바로 요청 — API 가 reason 을 필수로 받아 'other' 로 보낸다
  const handleLeave = async () => {
    setShowLeave(false)
    try {
      await deleteAccount.mutateAsync({ reason: WithdrawReason.OTHER })
      router.replace('/')
    } catch (error) {
      showError(error, '탈퇴 처리에 실패했습니다.') // [refactored]
    }
  }

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
      router.replace('/')
    } catch (error) {
      showError(error, '로그아웃에 실패했습니다.') // [refactored]
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
              <Button
                variant="fill"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
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
                maxLength={NAME_MAX_LENGTH}
                placeholder="입력해보세요"
                readOnly={isBreeder}
                className={isBreeder ? READONLY_INPUT_CLASS : undefined} // [refactored]
              />
              {!isBreeder && (
                <p className="mt-1 self-end text-[0.625rem] leading-[1.5] font-medium text-neutral-700">
                  {name.length}/{NAME_MAX_LENGTH}
                </p>
              )}
            </InputField>

            <TextareaField
              label="소개"
              placeholder="입력해보세요"
              maxLength={BIO_MAX_LENGTH}
              currentLength={bio.length}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[6.5625rem]"
            />

            {/* 소셜 로그인 이메일은 입양자 프로필에만 있어 브리더에선 숨김 */}
            {!isBreeder && (
              <InputField label="소셜 로그인">
                {/* [refactored] 표시 전용 스타일은 활동명 readOnly와 공유 */}
                <Input value={email} readOnly className={READONLY_INPUT_CLASS} />
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
          disabled: !isFormFilled || !isDirty || isSaving,
        }}
      >
        {/* 적용 완료·실패 토스트 — 버튼 바로 위 위치(레이아웃 안 밀림) + 풀 너비 */}
        {toast.current && (
          <Container className="absolute inset-x-0 bottom-[5rem]">
            <AlertMessage
              status={toast.current.status}
              size="responsive"
              icon={toast.current.status === 'error' ? AlertCircleIcon : CheckIcon}
              message={toast.current.message}
              onClose={toast.hide}
            />
          </Container>
        )}
      </FooterCtaBar>

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
        description={LEAVE_DESCRIPTION}
        actions={[
          { label: '계정 탈퇴', variant: 'outline', onClick: handleLeave },
          { label: '다시 생각해볼게요', variant: 'fill', onClick: () => setShowLeave(false) },
        ]}
      />
    </div>
  )
}

export { ProfileEditContent }
