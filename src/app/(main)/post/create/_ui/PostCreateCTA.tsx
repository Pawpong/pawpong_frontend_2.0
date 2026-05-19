'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@/shared/assets/icons'
import {
  Container,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'

const VISIBILITY_OPTIONS = [
  { id: 'public', label: '전체공개' },
  { id: 'followers', label: '팔로워 공개' },
  { id: 'private', label: '나만보기' },
] as const

type VisibilityType = (typeof VISIBILITY_OPTIONS)[number]['id']

interface PostCreateCTAProps {
  onSaveDraft: () => void
  onUpload: () => void
  isValid: boolean
}

const PostCreateCTA = ({ onSaveDraft, onUpload, isValid }: PostCreateCTAProps) => {
  const [visibility, setVisibility] = useState<VisibilityType>('public')

  const activeLabel = VISIBILITY_OPTIONS.find((o) => o.id === visibility)?.label

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/50 backdrop-blur-sm">
      <Container className="tab:px-[6.25rem]">
        <div className="flex h-[5.875rem] items-center justify-between">
          {/* Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 rounded-[0.375rem] border border-fill-muted px-[0.625rem] py-[0.25rem]"
              >
                <span className="text-sm font-medium text-text-primary">
                  {activeLabel}
                </span>
                <ChevronDownIcon className="size-6 text-text-primary" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="min-w-[8rem] rounded-md p-0">
              {VISIBILITY_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => setVisibility(option.id)}
                  className={`px-4 py-2.5 text-sm font-medium ${
                    visibility === option.id
                      ? 'bg-surface-primary text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              className="h-12 w-[17rem] rounded-full border border-fill-muted text-base font-semibold text-text-primary"
            >
              임시저장
            </button>
            <button
              type="button"
              onClick={onUpload}
              disabled={!isValid}
              className="h-12 w-[17rem] rounded-full bg-fill-muted text-base font-semibold text-text-primary disabled:opacity-50"
            >
              업로드
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export { PostCreateCTA }
