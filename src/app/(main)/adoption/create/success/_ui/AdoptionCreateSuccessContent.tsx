import Link from 'next/link'
import { Container } from '@/shared/ui'

const AdoptionCreateSuccessContent = () => {
  return (
    <Container className="flex flex-1 items-center justify-center py-10">
      <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-[#f5f5f5] px-6 py-40">
        <p className="text-xl font-bold leading-[1.375rem] text-text-primary tab:text-[1.875rem]">
          분양글이 성공적으로 업로드 되었습니다.
        </p>
        <div className="mt-16 flex items-center gap-[1.438rem]">
          <Link
            href="/"
            className="flex h-12 w-[11.9375rem] items-center justify-center rounded-full bg-[#d4d4d4] text-base font-semibold text-text-primary"
          >
            홈으로
          </Link>
          <Link
            href="/adoption/my-listings"
            className="flex h-12 w-[11.9375rem] items-center justify-center rounded-full bg-[#d4d4d4] text-base font-semibold text-text-primary"
          >
            작성한 글 보러가기
          </Link>
        </div>
      </div>
    </Container>
  )
}

export { AdoptionCreateSuccessContent }
