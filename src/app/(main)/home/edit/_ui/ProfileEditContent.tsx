'use client'

import { useState, type ComponentProps } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Container,
  CtaModal,
  NavigationBar,
  ProfileAvatar,
  InputField,
  Input,
  TextareaField,
} from '@/shared/ui'

// TODO: 실데이터 연결 — 프로필 조회로 초기값, 저장 mutation 연결
const MOCK_EMAIL = 'eunjinchoe94@gmail.com'

// [refactored] 아이콘·X 없는 반응형 확인 모달 프리셋 (적용/탈퇴 공용)
const ConfirmModal = (
  props: Omit<ComponentProps<typeof CtaModal>, 'icon' | 'showClose' | 'direction'>,
) => <CtaModal icon={null} showClose={false} direction="responsive" {...props} />

/** 프로필 편집 (Figma node 2145-191107) — GNB는 MainLayout 제공 */
const ProfileEditContent = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [showLeave, setShowLeave] = useState(false)

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
              {/* TODO: 이미지 업로드 연결 */}
              <Button variant="fill" className="w-full">
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
                maxLength={30}
                placeholder="입력해보세요"
              />
              <p className="mt-1 self-end text-[0.625rem] leading-[1.5] font-medium text-[#6b6b6b]">
                {name.length}/30
              </p>
            </InputField>

            <TextareaField
              label="소개"
              placeholder="입력해보세요"
              maxLength={100}
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

      {/* 하단 CTA — 디자인(1054-36832): 전체공개 드롭다운 없어도 바 높이 94px 유지 */}
      <Container className="flex h-[5.875rem] items-center justify-end">
        <div className="flex w-full gap-5 tab:w-[22.5rem]">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex-1">
            그만두기
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowApply(true)} className="flex-1">
            프로필 적용
          </Button>
        </div>
      </Container>

      {/* 프로필 적용 확인 (디자인 2145-192876 / 모바일·탭 2145-192877) */}
      <ConfirmModal
        open={showApply}
        onOpenChange={setShowApply}
        title="프로필을 적용하시겠습니까?"
        actions={[
          { label: '취소', variant: 'outline', onClick: () => setShowApply(false) },
          // TODO: 저장 mutation 연결
          { label: '적용하기', variant: 'fill', onClick: () => setShowApply(false) },
        ]}
      />

      {/* 계정 탈퇴 확인 (디자인 2145-193207 / 모바일·탭 2145-193342) */}
      <ConfirmModal
        open={showLeave}
        onOpenChange={setShowLeave}
        title="포퐁을 떠나실 건가요?"
        description={
          <>
            {/* 줄바꿈 위치가 데스크탑/모바일·탭 다름 */}
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
        }
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
