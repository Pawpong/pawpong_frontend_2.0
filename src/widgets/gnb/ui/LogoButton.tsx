import Link from 'next/link'

const LogoButton = () => {
  return (
    <Link href="/" className="text-xl font-bold" aria-label="홈으로 이동">
      Pawpong
    </Link>
  )
}

export { LogoButton }
