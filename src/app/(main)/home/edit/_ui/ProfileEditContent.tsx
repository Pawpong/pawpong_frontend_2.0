'use client'

import { useState, useRef, useEffect, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
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

// TODO: 실데이터 연결 — 프로필 조회로 초기값, 저장 mutation 연결
const MOCK_EMAIL = 'eunjinchoe94@gmail.com'

// [refactored] 매직 넘버·문자열 상수화
const TOAST_DURATION_MS = 3000
const NAME_MAX_LENGTH = 30
const BIO_MAX_LENGTH = 100
const BELOW_PC_QUERY = '(max-width: 89.99rem)' // pc(1440px) 미만 = 모바일·탭

// [refactored] 아이콘·X 없는 반응형 확인 모달 프리셋 (적용/탈퇴 공용)
const ConfirmModal = (
  props: Omit<ComponentProps<typeof CtaModal>, 'icon' | 'showClose' | 'direction'>,
) => <CtaModal icon={null} showClose={false} direction="responsive" {...props} />

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

// [refactored] 사진 선택 로직 분리 (SRP) — pc는 바로 파일 선택, 모바일·탭은 바텀시트
const usePhotoPicker = () => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const openFilePicker = (capture: boolean) => {
    setSheetOpen(false)
    if (capture) inputRef.current?.setAttribute('capture', 'environment')
    else inputRef.current?.removeAttribute('capture')
    inputRef.current?.click()
  }

  const requestChange = () => {
    if (window.matchMedia(BELOW_PC_QUERY).matches) {
      setSheetOpen(true)
      return
    }
    openFilePicker(false)
  }

  return { inputRef, sheetOpen, setSheetOpen, openFilePicker, requestChange }
}

/** 프로필 편집 (Figma node 2145-191107) — GNB는 MainLayout 제공 */
const ProfileEditContent = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [showLeave, setShowLeave] = useState(false)

  const toast = useToast() // [refactored]
  const photo = usePhotoPicker() // [refactored]

  // 사진 제외 모든 입력 필드가 채워져야 적용 가능 (소셜 로그인은 readOnly로 항상 채워짐)
  const isFormFilled = name.trim().length > 0 && bio.trim().length > 0

  // [refactored] 적용 확인 후 토스트 노출
  const handleApply = () => {
    // TODO: 저장 mutation 연결
    setShowApply(false)
    toast.show()
  }

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="프로필 편집" backHref="/home" />

      {/* 디자인: 모바일 px-16(margin-mo) / 탭+ px-80(margin-pc), py-48 */}
      <Container className="flex flex-col items-center gap-[2.625rem] px-4 py-12 tab:px-20">
        <div className="flex w-full max-w-[37.5rem] flex-col items-center gap-11">
          {/* 아바타 + 사진 변경 */}
          <div className="flex w-28 flex-col items-center gap-8">
            <ProfileAvatar size="xlarge" />
            <div className="flex w-full flex-col items-center gap-3">
              {/* TODO: 선택한 파일 업로드 연결 (onChange) */}
              <input
                ref={photo.inputRef} // [refactored]
                type="file"
                accept="image/*"
                className="hidden"
                onChange={() => {
                  // TODO: 이미지 업로드 mutation 연결
                }}
              />
              <Button variant="fill" className="w-full" onClick={photo.requestChange}>
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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX_LENGTH} // [refactored]
                placeholder="입력해보세요"
              />
              <p className="mt-1 self-end text-[0.625rem] leading-[1.5] font-medium text-[#6b6b6b]">
                {name.length}/{NAME_MAX_LENGTH} {/* [refactored] */}
              </p>
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

            <InputField label="소셜 로그인">
              {/* 표시 전용 — readOnly(수정X) + tabIndex/-1·focus 보더 중립화(focus X) */}
              <Input
                value={MOCK_EMAIL}
                readOnly
                className="cursor-default focus:border-[#e4e4e4]"
              />
            </InputField>
          </div>
        </div>

        {/* 탈퇴 / 로그아웃 — 로그아웃은 TODO 연결 */}
        <div className="flex items-center gap-10">
          <Button variant="text" onClick={() => setShowLeave(true)}>
            탈퇴
          </Button>
          <Button variant="text">로그아웃</Button>
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
              disabled={!isFormFilled}
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
        open={photo.sheetOpen} // [refactored]
        onOpenChange={photo.setSheetOpen} // [refactored]
        title="사진변경"
        actions={[
          { label: '사진첩 보기', onClick: () => photo.openFilePicker(false) }, // [refactored]
          { label: '촬영하기', onClick: () => photo.openFilePicker(true) }, // [refactored]
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
          // TODO: 탈퇴 mutation 연결
          { label: '계정 탈퇴', variant: 'outline', onClick: () => setShowLeave(false) },
          { label: '다시 생각해볼게요', variant: 'fill', onClick: () => setShowLeave(false) },
        ]}
      />
    </div>
  )
}

export { ProfileEditContent }
