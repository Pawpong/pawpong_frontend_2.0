import Link from 'next/link'
import { ArrowBackIcon } from '@/shared/assets'
import { Container } from './Container'

interface PageHeaderProps {
  title: string
  backHref: string
}

const PageHeader = ({ title, backHref }: PageHeaderProps) => (
  <Container>
    <div className="flex items-center gap-[0.625rem] py-3 tab:justify-center tab:pt-[1.5rem] tab:pb-[2rem]">
      <Link
        href={backHref}
        className="-mx-2.5 -my-2.5 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 tab:mx-0 tab:-my-2 tab:w-auto tab:flex-1 tab:justify-start"
        aria-label="뒤로 가기"
      >
        <ArrowBackIcon className="size-5 text-text-primary tab:size-6" />
      </Link>
      <h1 className="text-sm leading-[1.5] font-semibold text-text-primary tab:text-xl tab:leading-[1.375rem] tab:font-bold">
        {title}
      </h1>
      <div className="hidden flex-1 tab:block" />
    </div>
  </Container>
)

export { PageHeader }
