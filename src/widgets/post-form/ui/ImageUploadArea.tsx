'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { tv, type VariantProps } from 'tailwind-variants'
import { CameraIcon, ImageIcon, CloseIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { BREAKPOINTS } from '@/shared/lib/useBreakpoint'
import { ImageModal, PhotoSelectPrompt } from '@/shared/ui'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/shared/ui'

const MAX_IMAGES = 10

/**
 * 업로드 타일 지오메트리.
 * - default: 기존 화면(분양글 등장록·부모견·사육환경·명예의전당)이 쓰는 기존 규격
 * - post: 커뮤니티 게시글 작성 (Figma 1056-46032 PC / 1056-46732 tab·mo) — mo·tab 100·radius4, PC 180·radius8
 */
const imageUploadVariants = tv({
  slots: {
    root: 'flex flex-col',
    tiles: 'flex',
    addButton: 'flex shrink-0 flex-col items-center',
    addIcon: '',
    addCounter: '',
    preview: 'relative shrink-0 overflow-hidden',
  },
  variants: {
    size: {
      default: {
        root: 'gap-[0.375rem] tab:gap-3',
        tiles: 'gap-[0.375rem] tab:flex-wrap tab:gap-x-[1.438rem] tab:gap-y-3',
        addButton:
          'size-[3.793rem] rounded-[0.438rem] border border-[#cdcdcd] pt-[0.802rem] pr-[1.162rem] pb-[0.569rem] pl-[1.131rem] tab:h-[12.623rem] tab:w-[12.363rem] tab:justify-center tab:gap-[0.188rem] tab:rounded-[0.596rem] tab:border-fill-placeholder tab:p-0',
        addIcon: 'size-[1.459rem] text-text-primary tab:size-[3.285rem]',
        addCounter: 'text-[0.729rem] font-medium text-text-primary tab:text-[1.642rem]',
        preview:
          'size-[3.793rem] rounded-[0.438rem] border border-[#cdcdcd] bg-fill-placeholder tab:h-[12.623rem] tab:w-[12.363rem] tab:rounded-[0.596rem] tab:border-0',
      },
      composer: {
        root: 'gap-3',
        tiles: 'grid grid-cols-3 gap-3',
        addButton:
          'aspect-square w-full justify-center gap-2 rounded-xl border border-primary-200 bg-point-50 p-3 text-primary-700 transition-colors hover:bg-point-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50',
        addIcon: 'size-8 text-primary-500',
        addCounter: 'text-xs font-semibold text-primary-700',
        preview: 'aspect-square min-w-0 rounded-xl border border-neutral-150 bg-point-50',
      },
      post: {
        root: 'gap-1 pc:gap-2',
        tiles: 'flex-wrap gap-3',
        addButton:
          'size-25 justify-center gap-0.5 rounded border border-neutral-500 bg-white p-2 pc:size-45 pc:gap-2 pc:rounded-lg',
        addIcon: 'size-8 text-neutral-700',
        addCounter: 'text-sm leading-[1.5] font-semibold text-neutral-700 pc:text-base',
        preview: 'size-25 rounded border border-neutral-500 pc:size-45 pc:rounded-lg',
      },
    },
  },
  defaultVariants: { size: 'default' },
})

interface ImageUploadAreaProps extends VariantProps<typeof imageUploadVariants> {
  disabled?: boolean
  images: string[]
  onAdd: (files: FileList) => void
  onRemove: (index: number) => void
  /** 대표사진 인덱스 (옵션 — 넘기면 대표사진 기능 활성화) */
  representativeIndex?: number
  onSetRepresentative?: (index: number) => void
  /** 라벨 숨김 (외부에서 직접 라벨을 렌더링할 때) */
  hideLabel?: boolean
  /** 최대 이미지 수 */
  maxImages?: number
}

const ImageUploadArea = ({
  images,
  onAdd,
  onRemove,
  representativeIndex,
  onSetRepresentative,
  hideLabel = false,
  maxImages = MAX_IMAGES,
  size,
  disabled = false,
}: ImageUploadAreaProps) => {
  const styles = imageUploadVariants({ size })
  const isComposer = size === 'composer'
  const AddIcon = size === 'post' || isComposer ? CameraIcon : ImageIcon
  const inputRef = useRef<HTMLInputElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionIndex, setActionIndex] = useState(0)

  const [desktopModalOpen, setDesktopModalOpen] = useState(false)
  const [desktopModalIndex, setDesktopModalIndex] = useState(0)

  const hasRepresentative = representativeIndex !== undefined

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAdd(e.target.files)
      e.target.value = ''
    }
  }

  const isTabletUp = () => window.matchMedia(`(min-width: ${BREAKPOINTS.tab}px)`).matches

  const handleImageClick = (index: number) => {
    if (hasRepresentative) {
      if (isTabletUp()) {
        setDesktopModalIndex(index)
        setDesktopModalOpen(true)
      } else {
        setActionIndex(index)
        setActionDialogOpen(true)
      }
    } else {
      setModalIndex(index)
      setModalOpen(true)
    }
  }

  const isRepresentative = (index: number) => hasRepresentative && representativeIndex === index

  return (
    <div className={styles.root()}>
      {!hideLabel && (
        <p className="text-body-s text-text-primary">
          <span className="font-bold">이미지</span>{' '}
          <span className="hidden font-medium tab:inline">선택</span>
          <span className="text-xs font-medium tab:hidden">
            (최소 1장 이상 업로드 해주세요) 필수
          </span>
        </p>
      )}

      <div className={styles.tiles()}>
        {/* Composer starts with a large invitation, then keeps an add tile in the gallery. */}
        {(!isComposer || images.length < maxImages) && (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || images.length >= maxImages}
            aria-label={`사진 추가 (${images.length}/${maxImages})`}
            className={cn(
              styles.addButton(),
              isComposer && images.length === 0 && 'col-span-3 gap-4 p-6',
            )}
          >
            {isComposer && images.length === 0 ? (
              <PhotoSelectPrompt
                title="함께 나누고 싶은 순간이 있나요?"
                description="우리 아이의 사진을 골라주세요"
              />
            ) : (
              <>
                <AddIcon className={styles.addIcon()} />
                <span className={styles.addCounter()}>
                  {images.length}/{maxImages}
                </span>
              </>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={handleChange}
        />

        {/* Image Previews */}
        {images.map((src, index) => (
          <div
            key={src}
            className={cn(styles.preview(), isComposer && index === 0 && 'order-first col-span-3')}
          >
            <button
              type="button"
              disabled={disabled}
              className="size-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
              onClick={() => handleImageClick(index)}
              aria-label={`이미지 ${index + 1} ${isRepresentative(index) ? '대표사진' : '미리보기'}`}
            >
              <Image
                src={src}
                alt={`업로드 이미지 ${index + 1}`}
                fill
                sizes={
                  isComposer
                    ? index === 0
                      ? '(min-width: 1440px) 420px, (min-width: 768px) 50vw, 100vw'
                      : '(min-width: 1440px) 132px, (min-width: 768px) 17vw, 33vw'
                    : size === 'post'
                      ? '(min-width: 1440px) 180px, 100px'
                      : '(max-width: 767px) 61px, 198px'
                }
                className={isComposer && index === 0 ? 'object-contain' : 'object-cover'}
              />
            </button>

            {/* 대표사진 뱃지 */}
            {isRepresentative(index) && (
              <div className="pointer-events-none absolute bottom-0 left-1/2 flex h-[1.125rem] w-[3.813rem] -translate-x-1/2 items-center justify-center bg-[#929292] tab:left-0 tab:h-[2.188rem] tab:w-full tab:translate-x-0 tab:gap-[0.625rem] tab:bg-text-primary tab:p-[0.625rem]">
                <span className="text-[0.625rem] font-semibold text-white tab:text-base tab:font-bold">
                  대표사진
                </span>
              </div>
            )}

            {/* 삭제 버튼 (X) */}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(index)
              }}
              className={
                isComposer
                  ? 'absolute top-1 right-1 flex size-11 items-center justify-center rounded-full border border-neutral-150 bg-white text-neutral-850 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-50'
                  : 'absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-text-primary/60 tab:top-[0.323rem] tab:right-[0.323rem] tab:size-6'
              }
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <CloseIcon className={isComposer ? 'size-5' : 'size-2.5 text-white tab:size-3.5'} />
            </button>

            {/* 순번 — desktop only. post 타일(100·180)에는 45px 배지가 과해 노출하지 않는다 */}
            {!hasRepresentative && size !== 'post' && !isComposer && (
              <div className="pointer-events-none absolute top-0 left-0 hidden size-[2.822rem] items-center justify-center tab:flex">
                <span className="text-[1.562rem] leading-[1.552rem] font-bold text-white">
                  {index + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Image Preview Modal (기본 모드) */}
      {!hasRepresentative && (
        <ImageModal
          images={images}
          initialIndex={modalIndex}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onDelete={onRemove}
        />
      )}

      {/* 대표사진 모바일 액션 모달 */}
      {hasRepresentative && (
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="fixed top-1/2 left-1/2 z-modal w-[16rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white">
              <DialogTitle className="sr-only">이미지 옵션</DialogTitle>
              <div className="flex flex-col">
                {!isRepresentative(actionIndex) && (
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="w-full py-3.5 text-center text-sm font-medium text-text-primary"
                      onClick={() => onSetRepresentative?.(actionIndex)}
                    >
                      대표사진으로 변경
                    </button>
                  </DialogClose>
                )}
                <DialogClose asChild>
                  <button
                    type="button"
                    className="w-full border-t border-neutral-150 py-3.5 text-center text-sm font-medium text-error-500"
                    onClick={() => onRemove(actionIndex)}
                  >
                    이미지 삭제
                  </button>
                </DialogClose>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="w-full border-t border-[#e7e7e7] py-3.5 text-center text-sm font-medium text-text-primary"
                  >
                    취소
                  </button>
                </DialogClose>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}

      {/* 대표사진 데스크탑 이미지 모달 */}
      {hasRepresentative && (
        <ImageModal
          images={images}
          initialIndex={desktopModalIndex}
          open={desktopModalOpen}
          onOpenChange={setDesktopModalOpen}
          onDelete={onRemove}
          onSetRepresentative={onSetRepresentative}
          representativeIndex={representativeIndex}
        />
      )}
    </div>
  )
}

export { ImageUploadArea }
