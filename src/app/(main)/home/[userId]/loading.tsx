import { HomeSkeleton } from '../_ui/HomeSkeleton'

// 서버가 프로필을 받는 동안 먼저 보내는 화면. 브라우저 조회로 그릴 때와 같은 스켈레톤이다
const UserHomeLoading = () => <HomeSkeleton />

export default UserHomeLoading
