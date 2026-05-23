import Link from 'next/link'
import { Container } from '@/shared/ui'

const AdoptionCreateSuccessContent = () => {
  // TODO: 실제 API 연동 시 작성된 글의 listingId를 전달받아 사용
  const listingId = '1'

  return (
    <Container className="flex min-h-screen flex-col py-10">
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-[#f5f5f5] px-6">
        <p className="text-center text-[1.875rem] font-bold leading-[1.5] text-text-primary">
          <span className="tab:hidden">분양글이 성공적으로<br />업로드 되었습니다.</span>
          <span className="hidden tab:inline">분양글이 성공적으로 업로드 되었습니다.</span>
        </p>
        <div className="mt-16 flex flex-col items-center gap-[1.4375rem] tab:flex-row">
          <Link
            href="/"
            className="flex h-12 w-[11.9375rem] items-center justify-center rounded-full bg-[#d4d4d4] text-base font-semibold text-text-primary"
          >
            홈으로
          </Link>
          <Link
            href={`/adoption/${listingId}`}
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
