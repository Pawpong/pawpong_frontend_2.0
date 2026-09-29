'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { breederQueries } from '@/entities/breeder'
import { useDistrictOptions } from '@/entities/district'
import { profileQueries } from '@/entities/profile'
import { useUpdateAdopterProfile } from '@/features/adopter'
import { useUpdateBreederProfile } from '@/features/breeder'
import { useUpdateMyProfile } from '@/features/profile'
import { useUploadSingleFile } from '@/features/upload'
import { normalizeApiError, uploadSingleFile } from '@/shared/api'
import { TEXT } from '@/shared/config'
import type { ProfileUpdateRequestDto } from '@/shared/types'
import { useToast } from '@/shared/lib/useToast'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import {
  AlertMessage,
  AsyncState,
  Button,
  CtaModal,
  Dropdown,
  ExitConfirmModal,
  Input,
  InputField,
  KeywordTextField,
  NavigationBar,
  ProfileAvatar,
  Switch,
  TextareaField,
} from '@/shared/ui'
import { AlertCircleIcon, CheckIcon } from '@/shared/assets'

import { resolveRepresentativePhotos, type PhotoSlot } from '../_lib/representativePhotos'
import {
  AUTH_PROVIDER_LABEL,
  BIO_MAX_LENGTH,
  BREEDS_MAX_COUNT,
  LONG_DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PET_TYPE_LABEL,
} from '../_lib/profileEditOptions'
import { ProfileSection } from './ProfileSection'
import { RepresentativePhotosField } from './RepresentativePhotosField'

const EMPTY: string[] = []

/** 읽기 전용 값 — 입력칸 테두리 없이 값 텍스트만 (분양 상세의 라벨·값 표시와 같은 토큰) */
const READONLY_VALUE = `${TEXT.body} break-all pt-1`

/** 순서 무관 배열 비교 — 칩·키워드 선택 변경 감지용 */
const sameItems = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')

const ToggleRow = ({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}) => (
  <label className="flex cursor-pointer items-start justify-between gap-4">
    <span className="flex flex-col gap-0.5">
      <span className={TEXT.body}>{title}</span>
      <span className={TEXT.meta}>{description}</span>
    </span>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
  </label>
)

/** 프로필 편집 — 입양자·브리더 공용. GNB는 MainLayout 제공 */
const ProfileEditContent = () => {
  const router = useRouter()
  const qc = useQueryClient()
  const toast = useToast()
  const showError = (error: unknown, fallback: string) =>
    toast.error(normalizeApiError(error, fallback).message)

  // ── 조회 ──
  // /profile/me: 역할·닉네임·소개·긴 소개·주소·대표사진 (입양자·브리더 공용)
  const myProfileQuery = useQuery({
    ...profileQueries.me(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const myProfile = myProfileQuery.data
  const isBreeder = myProfile?.role === 'breeder'

  // 입양자 활동명·로그인 이메일
  const adopterProfileQuery = useQuery({
    ...adopterQueries.profile(),
    enabled: myProfile?.role === 'adopter',
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const adopterProfile = adopterProfileQuery.data

  // 브리더 관리 프로필: 분양 동물·품종·마케팅 동의·로그인 정보
  // (대표사진은 여기서 60분 서명 URL로 와 저장값으로 쓰면 안 되므로 /profile/me 의 공개 URL을 쓴다)
  const breederProfileQuery = useQuery({
    ...breederQueries.myProfile(),
    enabled: isBreeder,
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const breederProfile = breederProfileQuery.data

  // ── 서버 원본값 — 폼 시드와 변경 감지의 기준 ──
  const savedName = (isBreeder ? myProfile?.nickname : adopterProfile?.nickname) ?? ''
  const savedBio = myProfile?.bio ?? ''
  const savedLongDescription = myProfile?.longDescription ?? ''
  const savedCity = myProfile?.businessLocation?.city ?? ''
  const savedDistrict = myProfile?.businessLocation?.district ?? ''
  const savedDetailAddress = myProfile?.businessLocation?.address ?? ''
  const representativePhotos = myProfile?.representativePhotos ?? EMPTY
  const savedBreeds = breederProfile?.breeds ?? EMPTY
  const savedMarketingAgreed = breederProfile?.marketingAgreed ?? false

  // ── 폼 상태 ──
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [pendingPhotos, setPendingPhotos] = useState<PhotoSlot[] | null>(null)
  const [breeds, setBreeds] = useState<string[]>([])
  const [marketingAgreed, setMarketingAgreed] = useState(false)
  const [showApply, setShowApply] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // 조회값으로 폼 초기화 (최초 1회) — effect 대신 렌더 중 동기화(React 권장 패턴)
  const [seeded, setSeeded] = useState(false)
  const seedReady = isBreeder ? !!myProfile : !!(adopterProfile && myProfile)
  if (!seeded && seedReady) {
    setName(savedName)
    setBio(savedBio)
    setLongDescription(savedLongDescription)
    setCity(savedCity)
    setDistrict(savedDistrict)
    setDetailAddress(savedDetailAddress)
    setSeeded(true)
  }

  // 관리 프로필은 별도 요청이라 늦거나 실패할 수 있다 — 화면을 막지 않고 도착하면 따로 시드한다
  const [breederSeeded, setBreederSeeded] = useState(false)
  if (!breederSeeded && breederProfile) {
    setBreeds(savedBreeds)
    setMarketingAgreed(savedMarketingAgreed)
    setBreederSeeded(true)
  }

  const { cityOptions, districtOptions } = useDistrictOptions(city, isBreeder)
  // 시/도를 바꾸면 이전 시/군구는 그 시/도에 없는 값이라 비운다
  const handleCityChange = (next: string) => {
    setCity(next)
    setDistrict('')
  }

  // ── 프로필 사진 — 선택 즉시 업로드하고 적용 시 파일명만 저장한다 ──
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadFile = useUploadSingleFile()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFileName, setPhotoFileName] = useState<string | null>(null)
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 시에도 onChange 발생
    if (!file) return
    try {
      const res = await uploadFile.mutateAsync({ file, folder: 'profile' })
      setPhotoPreview(res.cdnUrl)
      setPhotoFileName(res.fileName)
    } catch (error) {
      showError(error, '사진 업로드에 실패했습니다.')
    }
  }

  // ── 변경 감지 ──
  const isLocationDirty =
    city !== savedCity || district !== savedDistrict || detailAddress !== savedDetailAddress
  const isBreederDetailDirty =
    breederSeeded && (!sameItems(breeds, savedBreeds) || marketingAgreed !== savedMarketingAgreed)
  const isDirty =
    name !== savedName ||
    bio !== savedBio ||
    longDescription !== savedLongDescription ||
    isLocationDirty ||
    pendingPhotos !== null ||
    !!photoFileName ||
    isBreederDetailDirty

  // 활동명(입양자)만 필수. 브리더명은 이 화면에서 바꾸지 않는다.
  // 주소는 시/도·시/군구가 짝으로 있어야 서버가 받는다(LocationUpdateDto 필수 필드).
  const isFormValid =
    (isBreeder || name.trim().length > 0) && (!isLocationDirty || (!!city && !!district))
  const updateAdopterProfile = useUpdateAdopterProfile()
  const updateBreederProfile = useUpdateBreederProfile()
  const updateMyProfile = useUpdateMyProfile()
  const isSaving =
    updateAdopterProfile.isPending ||
    updateBreederProfile.isPending ||
    updateMyProfile.isPending ||
    isApplying ||
    uploadFile.isPending

  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges: isDirty,
    enabled: seedReady,
  })
  const handleClose = () => {
    if (requestExit()) router.push('/home')
  }
  const handleExitConfirm = () => confirmExit(() => router.push('/home'))

  // ── 적용 ──
  //  - 공용: 소개(bio) → PATCH /profile/me
  //  - 입양자: 활동명·사진 → PATCH /adopter/profile
  //  - 브리더: 사진·긴 소개·주소·대표사진·품종·마케팅 동의 → PATCH /breeder-management/profile
  const buildBreederChanges = async (): Promise<ProfileUpdateRequestDto> => {
    const profilePhotos =
      pendingPhotos === null
        ? undefined
        : await resolveRepresentativePhotos(
            pendingPhotos,
            async (file) => (await uploadSingleFile(file, 'representative')).cdnUrl,
          )
    return {
      // 공개 조회는 representativePhotos, 수정 요청은 profilePhotos 를 사용한다
      ...(profilePhotos !== undefined && { profilePhotos }),
      ...(photoFileName && { profileImage: photoFileName }),
      ...(longDescription !== savedLongDescription && { profileDescription: longDescription }),
      ...(isLocationDirty && {
        locationInfo: {
          cityName: city,
          districtName: district,
          detailAddress: detailAddress.trim() || undefined,
        },
      }),
      ...(breederSeeded && !sameItems(breeds, savedBreeds) && { breeds }),
      ...(breederSeeded && marketingAgreed !== savedMarketingAgreed && { marketingAgreed }),
    }
  }

  const handleApply = async () => {
    if (isApplying) return
    setIsApplying(true)
    setShowApply(false)
    try {
      const tasks: Promise<unknown>[] = []
      if (bio !== savedBio) tasks.push(updateMyProfile.mutateAsync({ bio }))
      if (isBreeder) {
        const changes = await buildBreederChanges()
        if (Object.keys(changes).length > 0) tasks.push(updateBreederProfile.mutateAsync(changes))
      } else if (name !== savedName || photoFileName) {
        tasks.push(
          updateAdopterProfile.mutateAsync({
            name,
            ...(photoFileName && { profileImage: photoFileName }),
          }),
        )
      }
      await Promise.all(tasks)
      // 각 mutation 이 최신 프로필 refetch까지 기다리므로 서버 이미지로 안전하게 전환할 수 있다
      setPhotoFileName(null)
      setPhotoPreview(null)
      await qc.invalidateQueries({ queryKey: breederQueries.all() })
      setPendingPhotos(null)
      // 저장된 값을 새 기준으로 다시 시드한다
      setBreederSeeded(false)
      toast.success('프로필이 변경되었습니다')
    } catch (error) {
      showError(error, '프로필 적용에 실패했습니다.')
    } finally {
      setIsApplying(false)
    }
  }

  // ── 로딩·오류 ──
  const profilePending =
    myProfileQuery.isPending || (myProfile?.role === 'adopter' && adopterProfileQuery.isPending)
  const profileError =
    !profilePending &&
    (myProfileQuery.isError ||
      !myProfile ||
      (myProfile.role === 'adopter' && (adopterProfileQuery.isError || !adopterProfile)))

  if (!seedReady) {
    return (
      <div className="flex w-full flex-col">
        <NavigationBar title="프로필 편집" backHref="/home" />
        <AsyncState
          status={profileError ? 'error' : 'loading'}
          message={
            profileError
              ? '프로필을 불러오지 못했습니다.'
              : profilePending
                ? '프로필을 불러오는 중입니다.'
                : '프로필을 확인할 수 없습니다.'
          }
          action={
            profileError ? (
              <Button
                intent="dark"
                size="sm"
                onClick={() => {
                  void myProfileQuery.refetch()
                  if (myProfile?.role === 'adopter') void adopterProfileQuery.refetch()
                }}
              >
                다시 시도
              </Button>
            ) : undefined
          }
          className="min-h-[calc(100dvh-7rem)]"
        />
      </div>
    )
  }

  const loginProvider = isBreeder ? breederProfile?.authProvider : adopterProfile?.authProvider
  const loginEmail = isBreeder ? breederProfile?.breederEmail : adopterProfile?.emailAddress
  const breederFieldsDisabled = isSaving || !breederSeeded

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="프로필 편집" onBack={handleClose} />

      {/* 하단 고정 바(약 80px)만큼 아래 여백을 둔다 */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 pt-8 pb-36 tab:gap-12 tab:px-8 tab:pt-12">
        {/* ── 프로필 헤더: 사진 · 이름 · 계정 ── */}
        <header className="flex items-center gap-4 tab:gap-6">
          <ProfileAvatar size="xlarge" src={photoPreview ?? myProfile?.profileImageUrl} />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <h1 className="truncate font-cafe24 text-xl text-neutral-850 tab:text-2xl">
              {savedName || '활동명을 입력해주세요'}
            </h1>
            <p className={TEXT.meta}>
              {isBreeder ? '브리더' : '입양자'}
              {loginProvider && ` · ${AUTH_PROVIDER_LABEL[loginProvider]} 로그인`}
            </p>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                intent="secondary"
                size="sm"
                disabled={uploadFile.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile.isPending ? '올리는 중…' : '사진 변경'}
              </Button>
            </div>
          </div>
        </header>

        {/* ── 기본 정보 ── */}
        <ProfileSection title="기본 정보">
          {isBreeder ? (
            // 읽기 전용 값은 입력칸 대신 텍스트로 보여줘 수정할 수 있는 필드와 구분한다
            <InputField label="브리더명">
              <p className={READONLY_VALUE}>{name}</p>
            </InputField>
          ) : (
            <InputField label="포퐁 활동명" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX_LENGTH}
                placeholder="활동명을 입력해주세요"
              />
              <p className={`${TEXT.meta} mt-1`}>
                {name.length}/{NAME_MAX_LENGTH}
              </p>
            </InputField>
          )}

          <TextareaField
            label="한 줄 소개"
            placeholder="나를 한 줄로 소개해주세요"
            maxLength={BIO_MAX_LENGTH}
            currentLength={bio.length}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[6.5625rem]"
          />
        </ProfileSection>

        {isBreeder && (
          <>
            {/* ── 브리더 소개 ── */}
            <ProfileSection
              title="브리더 소개"
              description="브리더 홈에서 입양자가 가장 먼저 보는 정보예요."
            >
              <TextareaField
                label="소개글"
                placeholder="케어 환경과 분양 철학을 소개해주세요"
                maxLength={LONG_DESCRIPTION_MAX_LENGTH}
                currentLength={longDescription.length}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                className="min-h-[10rem]"
              />
              <RepresentativePhotosField
                photos={pendingPhotos ?? representativePhotos}
                disabled={isSaving}
                onChange={setPendingPhotos}
                onError={(error) => showError(error, '사진을 선택하지 못했습니다.')}
              />
            </ProfileSection>

            {/* ── 분양 정보 ── */}
            <ProfileSection title="분양 정보">
              {/* 가입 때 정한 값이라 수정 API가 없다 — 보여주기만 한다 */}
              <InputField label="분양 동물">
                <p className={READONLY_VALUE}>
                  {breederProfile?.petType ? PET_TYPE_LABEL[breederProfile.petType] : '—'}
                </p>
              </InputField>

              <InputField label={`케어하는 품종 (최대 ${BREEDS_MAX_COUNT}개)`}>
                <KeywordTextField
                  value={breeds}
                  onChange={setBreeds}
                  maxSelected={BREEDS_MAX_COUNT}
                  placeholder="품종을 콤마(,)로 구분해 입력해주세요"
                />
              </InputField>
            </ProfileSection>

            {/* ── 활동 지역 ── */}
            <ProfileSection title="활동 지역">
              <div className="grid grid-cols-1 gap-2 tab:grid-cols-2">
                <Dropdown
                  value={city}
                  onValueChange={handleCityChange}
                  placeholder="시/도를 선택해주세요"
                  options={cityOptions}
                />
                <Dropdown
                  value={district}
                  onValueChange={setDistrict}
                  placeholder="시/군구를 선택해주세요"
                  options={districtOptions}
                  disabled={!city}
                />
              </div>
              <InputField label="상세 주소" requirement="선택">
                <Input
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="도로명 주소를 입력해주세요"
                />
              </InputField>
            </ProfileSection>

            {/* ── 알림 ── */}
            <ProfileSection title="알림">
              <ToggleRow
                title="마케팅 정보 수신"
                description="이벤트와 새로운 기능 소식을 받아요."
                checked={marketingAgreed}
                disabled={breederFieldsDisabled}
                onCheckedChange={setMarketingAgreed}
              />
            </ProfileSection>
          </>
        )}

        {/* ── 계정 ── */}
        <ProfileSection title="계정">
          <InputField label="로그인 이메일">
            <p className={READONLY_VALUE}>{loginEmail || '—'}</p>
          </InputField>
        </ProfileSection>
      </div>

      {/* ── 하단 고정 바 — 브리더 심사와 같은 구성 ── */}
      <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-neutral-100 bg-white pb-[env(safe-area-inset-bottom)]">
        {toast.current && (
          <div className="absolute inset-x-0 bottom-full mx-auto w-full max-w-3xl px-5 pb-3 tab:px-8">
            <AlertMessage
              status={toast.current.status}
              size="responsive"
              icon={toast.current.status === 'error' ? AlertCircleIcon : CheckIcon}
              message={toast.current.message}
              onClose={toast.hide}
            />
          </div>
        )}
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4 tab:px-8">
          <p className="hidden text-body-md text-neutral-500 tab:block">
            {isSaving
              ? '프로필을 적용하고 있어요.'
              : isDirty
                ? '적용하지 않은 변경 사항이 있어요.'
                : '바뀐 내용이 없어요.'}
          </p>
          <div className="flex w-full gap-2 tab:w-auto">
            <Button intent="secondary" width="fill" onClick={handleClose}>
              그만두기
            </Button>
            <Button
              width="fill"
              onClick={() => setShowApply(true)}
              disabled={!isFormValid || !isDirty || isSaving}
            >
              {isSaving ? '적용 중…' : '프로필 적용'}
            </Button>
          </div>
        </div>
      </div>

      <CtaModal
        open={showApply}
        onOpenChange={setShowApply}
        icon={null}
        showClose={false}
        direction="responsive-reverse"
        title="프로필을 적용하시겠습니까?"
        actions={[
          { label: '취소', intent: 'secondary', onClick: () => setShowApply(false) },
          { label: '적용하기', intent: 'primary', onClick: handleApply },
        ]}
      />

      <ExitConfirmModal
        open={showGuard}
        onClose={cancelExit}
        onConfirm={handleExitConfirm}
        title="프로필 수정을 그만하시겠어요?"
      />
    </div>
  )
}

export { ProfileEditContent }
