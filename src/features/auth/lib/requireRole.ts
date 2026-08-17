import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * 서버에서 역할을 확인하고 통과하지 못하면 되돌려 보낸다 (브리더 전용 화면 보호).
 *
 * userRole 은 로그인 시 set-cookie 라우트가 심는 httpOnly=false 쿠키라 서버에서도 읽힌다.
 * 클라이언트 가드와 달리 화면이 한 번도 그려지지 않으므로 깜빡임이 없다.
 */
export const requireRole = async (role: 'adopter' | 'breeder'): Promise<void> => {
  const cookieStore = await cookies()
  const userRole = cookieStore.get('userRole')?.value

  if (!userRole) redirect('/login')
  if (userRole !== role) redirect('/')
}
