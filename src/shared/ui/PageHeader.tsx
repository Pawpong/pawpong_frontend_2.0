import Link from 'next/link'
import { ArrowBackIcon } from '@/shared/assets/icons'
import { Container } from './Container'

interface PageHeaderProps {
  title: string
  backHref: string
}

const PageHeader = ({ title, backHref }: PageHeaderProps) => (
  <>
    {/* 모바일 */}
    <div className="flex items-center gap-2.5 px-5 py-3 tab:hidden">
      <Link href={backHref} aria-label="뒤로 가기">
        <ArrowBackIcon className="size-5 text-text-primary" />
      </Link>
      <h1 className="text-sm font-semibold leading-[1.5] text-text-primary">
        {title}
      </h1>
    </div>

    {/* PC */}
    <div className="hidden tab:block">
      <Container>
        <div className="flex items-center justify-center py-10">
          <div className="flex flex-1 items-center">
            <Link href={backHref} aria-label="뒤로 가기">
              <ArrowBackIcon className="size-6 text-text-primary" />
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            {title}
          </h1>
          <div className="flex-1" />
        </div>
      </Container>
    </div>
  </>
)

export { PageHeader }
