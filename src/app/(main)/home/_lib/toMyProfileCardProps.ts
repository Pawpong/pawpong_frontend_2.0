import type { AdopterPublicProfile, BreederPublicProfile, MyProfile } from '@/shared/types'

type MyProfileCardProps =
  | { profile: AdopterPublicProfile; mode: 'mine' }
  | { profile: BreederPublicProfile; mode: 'mine-breeder' }

/** `/profile/me` 응답을 내 ProfileCard가 바로 받을 수 있는 props로 변환한다. */
export const toMyProfileCardProps = (profile: MyProfile): MyProfileCardProps => {
  if (profile.role === 'adopter') {
    return {
      mode: 'mine',
      profile: {
        userId: profile.userId,
        nickname: profile.nickname,
        profileImageUrl: profile.profileImageUrl,
        bio: profile.bio,
        bpm: profile.bpm,
        followerCount: profile.followerCount,
        isFollowing: false,
      },
    }
  }

  return {
    mode: 'mine-breeder',
    profile: {
      breederId: profile.userId,
      nickname: profile.nickname,
      profileImageUrl: profile.profileImageUrl,
      bio: profile.bio,
      longDescription: profile.longDescription,
      bpm: profile.bpm,
      followerCount: profile.followerCount,
      level: profile.level ?? 'new',
      plan: profile.plan ?? 'basic',
      businessLocation: {
        city: profile.businessLocation?.city ?? '',
        district: profile.businessLocation?.district ?? '',
        address: profile.businessLocation?.address,
      },
      isFavorited: false,
    },
  }
}
