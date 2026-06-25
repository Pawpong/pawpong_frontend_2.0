import Link from 'next/link'
import { cn } from '@/shared/lib/cn'

interface InputUploadProps {
  /** 안내 문구 (placeholder 역할) */
  text: string
  /** 우측 버튼 라벨 (탭·PC에서만 노출) */
  buttonText?: string
  /** 이동 경로 (바 전체가 링크) */
  href: string
  className?: string
}

/**
 * 게시글/분양글 작성 유도 바 (Figma node 818-110386 · InputUpload)
 * - 상·하 #cacaca 보더, 좌우 여백 mo16 / tab48 / pc80
 * - 모바일: 문구만, 탭·PC: 문구 + 작성하기 버튼
 */
const InputUpload = ({ text, buttonText = '작성하기', href, className }: InputUploadProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center border-y border-[#cacaca] bg-white px-4 py-2 tab:px-12 pc:px-20',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="truncate text-sm leading-[1.5] font-medium text-[#6b6b6b]">{text}</span>
        <span className="hidden h-8 shrink-0 items-center justify-center rounded-lg bg-[#3e3e3e] px-2 text-sm leading-[1.5] font-semibold text-[#f6f6f6] tab:flex">
          {buttonText}
        </span>
      </div>
    </Link>
  )
}

export { InputUpload }
