import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  linkText?: string
  linkHref?: string
}

const SectionHeader = ({ title, linkText, linkHref }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[0.875rem] font-bold leading-[1.5] text-[#5d5d5d] tab:text-[1.25rem]">
        {title}
      </p>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="text-[0.75rem] font-semibold text-[#5d5d5d] tab:text-[0.875rem]"
        >
          {`${linkText} >`}
        </Link>
      )}
    </div>
  )
}

export { SectionHeader }
