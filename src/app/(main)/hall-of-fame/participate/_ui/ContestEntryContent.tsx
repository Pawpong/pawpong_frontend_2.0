'use client'

import { Container } from '@/shared/ui'
import {
  usePostForm,
  PostFormHeader,
  PostFormTextArea,
  PostFormToolbar,
  PostFormCTA,
  ImageUploadArea,
} from '@/widgets/post-form'

const ContestEntryContent = () => {
  const {
    images,
    text,
    setText,
    textareaRef,
    handleAddImages,
    handleRemoveImage,
    handleEmojiSelect,
  } = usePostForm({ maxImages: 1 })

  const isValid = text.trim().length > 0 && images.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PostFormHeader title="명예의 전당 콘테스트 참여하기" />

      <Container className="flex-1 pb-[7.5rem] pt-[0.719rem] tab:px-[6.25rem] tab:pt-[5.5rem]">
        <div className="flex flex-col gap-[1.125rem] tab:flex-row tab:gap-0">
          <div className="tab:w-[26.256rem] tab:shrink-0">
            <ImageUploadArea
              images={images}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
              maxImages={1}
            />
          </div>

          <div className="flex flex-1 flex-col tab:ml-[2.5rem]">
            <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
              <PostFormTextArea
                ref={textareaRef}
                value={text}
                onChange={setText}
                placeholder="귀여운 파이리"
              />
              <PostFormToolbar onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
        </div>
      </Container>

      <PostFormCTA
        onSaveDraft={() => { }}
        onSubmit={() => { }}
        submitLabel="참여하기"
        isValid={isValid}
      />
    </div>
  )
}

export { ContestEntryContent }
