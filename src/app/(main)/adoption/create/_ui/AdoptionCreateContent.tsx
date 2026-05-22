'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { CloseIcon } from '@/shared/assets/icons'
import {
  Container,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'
import { ImageUploadArea } from '@/app/(main)/post/create/_ui/ImageUploadArea'
import { FormFieldLabel } from './FormFieldLabel'
import { HealthInfoSection } from './HealthInfoSection'
import { ParentInfoSection } from './ParentInfoSection'
import { BreedingEnvSection } from './BreedingEnvSection'

const AdoptionCreateContent = () => {
  const [images, setImages] = useState<string[]>([])
  const [representativeIndex, setRepresentativeIndex] = useState(0)

  const handleAddImages = useCallback((files: FileList) => {
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages].slice(0, 10))
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== index)
    })
    setRepresentativeIndex((prev) => {
      if (index === prev) return 0
      if (index < prev) return prev - 1
      return prev
    })
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 헤더: X + 제목 */}
      <Container>
        <div className="flex items-center gap-[0.625rem] py-3 tab:justify-between tab:py-6">
          <Link href="/adoption/my-listings">
            <CloseIcon className="size-5 text-text-primary tab:size-6" />
          </Link>
          <p className="text-sm font-semibold leading-[1.5] text-text-primary tab:flex-1 tab:text-center tab:text-xl">
            분양글 작성
          </p>
          {/* 우측 빈 공간 (데스크탑 중앙 정렬용) */}
          <div className="hidden size-6 tab:block" />
        </div>
      </Container>

      {/* 본문 */}
      <Container className="flex-1 pb-24">
        <div className="flex flex-col gap-[1.125rem] tab:flex-row tab:gap-[1.5rem] tab:pt-6">
          {/* 좌측: 이미지 업로드 */}
          <div className="tab:w-[26.256rem] tab:shrink-0">
            <ImageUploadArea
              images={images}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
              representativeIndex={representativeIndex}
              onSetRepresentative={setRepresentativeIndex}
            />
          </div>

          {/* 우측: 폼 필드 */}
          <div className="flex flex-1 flex-col gap-3 tab:gap-[1.375rem]">
            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="이름" required />
              <Input placeholder="레오파드게코 도마뱀(만다린).여.6개월" />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="품종" required />
              <Input placeholder="레오파드게코 도마뱀(만다린).여.6개월" />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="분양가" required />
              <Input placeholder="20,000원" />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="태어난 날짜" required />
              <Input placeholder="생년월일" />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="성별" required />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="성별 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">여자</SelectItem>
                  <SelectItem value="male">남자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="아이를 소개해주세요" required />
              <Textarea
                placeholder="생활패턴, 주거환경, 입양 시기 등을 입력해주세요"
                className="h-[5.125rem] tab:h-[6.813rem]"
              />
            </div>

            {/* 건강 정보 */}
            <HealthInfoSection />

            {/* 부모 정보 */}
            <ParentInfoSection />

            {/* 사육 환경 */}
            <BreedingEnvSection />
          </div>
        </div>
      </Container>

      {/* 하단 CTA */}
      <div className="bg-white pb-1유0 tab:pb-0">
        <Container className="flex items-center justify-end py-5 tab:py-[1.438rem]">
          <button
            type="button"
            disabled
            className="h-12 w-full rounded-full bg-[#d4d4d4] text-base font-semibold text-text-primary tab:w-[17rem]"
          >
            업로드
          </button>
        </Container>
      </div>
    </div>
  )
}

export { AdoptionCreateContent }
