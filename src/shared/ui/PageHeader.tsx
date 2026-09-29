import Link from 'next/link'
import { iconButtonVariants } from './IconButton'
import { ArrowBackIcon } from '@/shared/assets'
import { Container } from './Container'

interface PageHeaderProps {
  title: string
  backHref: string
}

const PageHeader = ({ title, backHref }: PageHeaderProps) => (
  <Container className="px-4">
    <div className="flex items-center gap-[0.625rem] py-3 tab:justify-center tab:pt-[1.5rem] tab:pb-[2rem]">
      <div className="-m-2.5 flex tab:mx-0 tab:-my-2 tab:flex-1">
        <Link href={backHref} className={iconButtonVariants()} aria-label="뒤로 가기">
          <ArrowBackIcon className="size-5 tab:size-6" />
        </Link>
      </div>
      <h1 className="text-sm leading-[1.5] font-semibold text-text-primary tab:text-xl tab:leading-[1.375rem] tab:font-bold">
        {title}
      </h1>
      <div className="hidden flex-1 tab:block" />
    </div>
  </Container>
)

export { PageHeader }
