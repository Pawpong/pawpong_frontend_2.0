import Link from 'next/link'

interface PostCreateBarProps {
  label?: string
  href?: string
}

const PostCreateBar = ({
  label = '게시글을 작성해보세요',
  href = '/post/create',
}: PostCreateBarProps) => {
  return (
    <div className="flex items-center justify-between py-[0.531rem]">
      <p className="text-sm leading-[1.375rem] font-medium text-text-primary tab:text-base">
        {label}
      </p>
      <Link
        href={href}
        className="flex h-8 w-[4.4375rem] items-center justify-center rounded-full bg-fill-muted text-base font-semibold text-white tab:h-12 tab:w-[7.125rem]"
      >
        작성
      </Link>
    </div>
  )
}

export { PostCreateBar }
