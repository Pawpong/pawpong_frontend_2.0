import { createPageMetadata } from '@/shared/lib/metadata'

import { ProfileEditContent } from './_ui/ProfileEditContent'

export const metadata = createPageMetadata({ title: '프로필 수정', noIndex: true })

const ProfileEditPage = () => <ProfileEditContent />

export default ProfileEditPage
