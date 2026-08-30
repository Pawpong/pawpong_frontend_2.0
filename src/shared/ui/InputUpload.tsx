import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { Container } from './Container'

interface InputUploadProps {
  /** 안내 문구 (placeholder 역할) */
  text: string
  /** 우측 버튼 라벨 (탭·PC에서만 노출) */
  buttonText?: string
  /** 이동 경로 (바 전체가 링크) */
  href: string
  /** 내용 행에 적용 — 좌우 여백을 주변 콘텐츠에 맞출 때 사용 */
  className?: string
}

/**
 * 게시글/분양글 작성 유도 바 (Figma node 818-110386 · InputUpload)
 * - 상·하 #cacaca 보더는 풀블리드, 내용은 Container 폭에 맞춘다 (주변 콘텐츠와 좌우 정렬)
 * - 모바일: 문구만, 탭·PC: 문구 + 작성하기 버튼
 */
const InputUpload = ({ text, buttonText = '작성하기', href, className }: InputUploadProps) => {
  return (
    <Link href={href} className="block border-y border-neutral-300 bg-white">
      <Container className={cn('flex items-center justify-between gap-3 py-2', className)}>
        <span className="min-w-0 truncate text-sm leading-[1.5] font-medium text-neutral-700">
          {text}
        </span>
        <span className="hidden h-8 shrink-0 items-center justify-center rounded-lg bg-neutral-850 px-2 text-sm leading-[1.5] font-semibold text-neutral-50 tab:flex">
          {buttonText}
        </span>
      </Container>
    </Link>
  )
}

export { InputUpload }
