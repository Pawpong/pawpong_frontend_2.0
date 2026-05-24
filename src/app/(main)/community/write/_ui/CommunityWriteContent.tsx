'use client'

import { useState } from 'react'
import { Container } from '@/shared/ui'
import {
  usePostForm,
  PostFormHeader,
  PostFormTextArea,
  PostFormToolbar,
  PostFormCTA,
  ImageUploadArea,
  VisibilitySelect,
  type VisibilityType,
} from '@/widgets/post-form'

const CommunityWriteContent = () => {
  const {
    images,
    text,
    setText,
    textareaRef,
    handleAddImages,
    handleRemoveImage,
    handleEmojiSelect,
  } = usePostForm()

  const [visibility, setVisibility] = useState<VisibilityType>('public')

  const isValid = text.trim().length > 0 || images.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PostFormHeader title="글 작성" mobileTitle="게시글 작성" />

      <Container className="flex-1 pt-[0.719rem] pb-[7.5rem] tab:px-[6.25rem] tab:pt-[5.5rem]">
        <div className="flex flex-col gap-[1.125rem] tab:flex-row tab:gap-0">
          <div className="tab:w-[26.256rem] tab:shrink-0">
            <ImageUploadArea images={images} onAdd={handleAddImages} onRemove={handleRemoveImage} />
          </div>

          <div className="flex flex-1 flex-col tab:ml-[2.5rem]">
            <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
              <PostFormTextArea
                ref={textareaRef}
                value={text}
                onChange={setText}
                placeholder="귀여운 동물을 자랑해보세요"
              />
              <PostFormToolbar onEmojiSelect={handleEmojiSelect} />
            </div>

            <div className="mt-[1.125rem] tab:hidden">
              <VisibilitySelect value={visibility} onChange={setVisibility} />
            </div>
          </div>
        </div>
      </Container>

      <PostFormCTA
        onSaveDraft={() => {}}
        onSubmit={() => {}}
        submitLabel="업로드"
        isValid={isValid}
        leftSlot={<VisibilitySelect value={visibility} onChange={setVisibility} />}
      />
    </div>
  )
}

export { CommunityWriteContent }
