import Link from 'next/link'
import { ArrowBackIcon } from '@/shared/assets/icons'

interface NavigationBarProps {
  title: string
  backHref: string
}

/** 서브 페이지 상단바 (뒤로가기 + 가운데 정렬 타이틀) — Figma node 976:25817 */
const NavigationBar = ({ title, backHref }: NavigationBarProps) => {
  return (
    <div className="flex items-center bg-white px-4 py-2 tab:px-12 pc:px-20">
      <div className="flex min-w-0 flex-1 items-center">
        <Link href={backHref} aria-label="뒤로 가기" className="shrink-0">
          <ArrowBackIcon className="size-6 text-[#3e3e3e]" />
        </Link>
        <span className="min-w-0 flex-1 truncate p-0.5 text-center text-base leading-[1.5] font-semibold text-[#3e3e3e]">
          {title}
        </span>
      </div>
    </div>
  )
}

export { NavigationBar }
