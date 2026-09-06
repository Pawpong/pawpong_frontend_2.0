import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type AuthRole = 'adopter' | 'breeder'

/** 로그인 쿠키를 서버에서 확인하고 유효한 역할을 반환한다. */
export const requireAuth = async (returnUrl?: string): Promise<AuthRole> => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const userRole = cookieStore.get('userRole')?.value

  if (!accessToken || (userRole !== 'adopter' && userRole !== 'breeder')) {
    redirect(returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login')
  }

  return userRole
}

/**
 * 서버에서 역할을 확인하고 통과하지 못하면 되돌려 보낸다 (브리더 전용 화면 보호).
 *
 * userRole 은 로그인 시 set-cookie 라우트가 심는 httpOnly=false 쿠키라 서버에서도 읽힌다.
 * 클라이언트 가드와 달리 화면이 한 번도 그려지지 않으므로 깜빡임이 없다.
 *
 * @param returnUrl 로그인 후 돌아올 경로. 서버 컴포넌트는 자신의 pathname 을 알 수 없어
 *                  호출부가 넘겨준다. 넘기면 /login?returnUrl=... 체인을 타 원래 화면으로 복귀한다
 */
export const requireRole = async (
  role: AuthRole,
  returnUrl?: string,
): Promise<void> => {
  const userRole = await requireAuth(returnUrl)
  if (userRole !== role) redirect('/')
}

export type { AuthRole }
