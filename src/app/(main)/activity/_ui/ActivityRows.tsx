import { TEXT } from '@/shared/config'
import { formatDate } from '@/shared/lib/formatDate'
import type {
  ApplicationListItemDto,
  ReceivedApplicationItemDto,
  MyReviewItemDto,
} from '@/shared/types'
import { ApplicationStatusBadge, ReviewTypeBadge, getReviewTypeForStatus } from './ActivityBadges'
import { ActivityIdentity } from './ActivityIdentity'
import { ActivityLinkCard } from './ActivityLinkCard'

export const ApplicationRow = ({ application }: { application: ApplicationListItemDto }) => (
  <ActivityLinkCard
    href={`/activity/applications/${application.applicationId}?view=sent`}
    identity={
      <ActivityIdentity
        name={application.breederName}
        image={application.profileImage}
        meta={`신청일 ${application.applicationDate}`}
        badge={<ApplicationStatusBadge status={application.status} />}
      />
    }
    action={
      application.reviewId
        ? '후기 보기'
        : getReviewTypeForStatus(application.status)
          ? '후기 작성'
          : '신청 상세 보기'
    }
  >
    <p className={TEXT.meta}>신청한 상담</p>
    <p className={`${TEXT.body} mt-1`}>
      {application.petName || (application.animalType === 'cat' ? '고양이 상담' : '강아지 상담')}
    </p>
  </ActivityLinkCard>
)

export const ReceivedApplicationRow = ({
  application,
}: {
  application: ReceivedApplicationItemDto
}) => (
  <ActivityLinkCard
    href={`/activity/applications/${application.applicationId}?view=received`}
    identity={
      <ActivityIdentity
        name={application.adopterName || application.adopterNickname}
        meta={`신청일 ${formatDate(application.appliedAt)}`}
        badge={<ApplicationStatusBadge status={application.status} />}
      />
    }
    action="신청서 확인하기"
  >
    <p className={TEXT.meta}>신청한 상담</p>
    <p className={`${TEXT.body} mt-1`}>{application.petName || '입양 상담 신청'}</p>
  </ActivityLinkCard>
)

export const SentReviewRow = ({ review }: { review: MyReviewItemDto }) => (
  <ActivityLinkCard
    href={`/activity/reviews/${review.reviewId}`}
    identity={
      <ActivityIdentity
        name={review.breederNickname || '알 수 없는 브리더'}
        image={review.breederProfileImage}
        meta={`작성일 ${formatDate(review.writtenAt)}`}
        badge={<ReviewTypeBadge reviewType={review.reviewType} />}
      />
    }
    action="후기 자세히 보기"
  >
    <p className={TEXT.prose}>{review.content}</p>
  </ActivityLinkCard>
)
