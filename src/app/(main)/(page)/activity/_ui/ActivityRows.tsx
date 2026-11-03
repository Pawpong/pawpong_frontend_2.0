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

/** 신청 대상 줄 — 아이를 골라 한 신청과 아이 없이 브리더에게 한 상담을 앞의 작은 표시로 먼저 구분한다 */
const ApplicationTarget = ({ petName, detail }: { petName?: string; detail?: string | null }) => (
  <>
    <span className="shrink-0 text-[0.8125rem] font-semibold text-neutral-700 tab:text-sm">
      {petName ? '아이' : '브리더 상담'}
    </span>
    <span aria-hidden className="h-3 shrink-0 border-l border-neutral-300" />
    <span className="min-w-0 truncate text-neutral-850">
      {petName ? [petName, detail].filter(Boolean).join(' · ') : detail}
    </span>
  </>
)

export const ApplicationRow = ({ application }: { application: ApplicationListItemDto }) => (
  <ActivityLinkCard
    href={`/activity/applications/${application.applicationId}`}
    identity={
      <ActivityIdentity
        name={application.breederName}
        image={application.profileImage}
        subtitle={
          <ApplicationTarget
            petName={application.petName}
            detail={
              application.petName
                ? application.petBreed
                : application.animalType === 'cat'
                  ? '고양이'
                  : '강아지'
            }
          />
        }
        badge={<ApplicationStatusBadge status={application.status} />}
      />
    }
    meta={`신청일 ${application.applicationDate}`}
    action={
      application.reviewId
        ? '후기 보기'
        : getReviewTypeForStatus(application.status)
          ? '후기 작성'
          : '신청 상세 보기'
    }
  />
)

export const ReceivedApplicationRow = ({
  application,
}: {
  application: ReceivedApplicationItemDto
}) => (
  <ActivityLinkCard
    href={`/activity/applications/${application.applicationId}`}
    identity={
      <ActivityIdentity
        name={application.adopterName || application.adopterNickname}
        subtitle={
          <ApplicationTarget
            petName={application.petName}
            detail={
              application.petName
                ? undefined
                : `원하는 아이: ${
                    application.preferredPetInfo ||
                    application.standardResponses?.preferredPetDescription ||
                    '미정'
                  }`
            }
          />
        }
        badge={<ApplicationStatusBadge status={application.status} />}
      />
    }
    meta={`신청일 ${formatDate(application.appliedAt)}`}
    action="신청서 확인하기"
  />
)

export const SentReviewRow = ({ review }: { review: MyReviewItemDto }) => (
  <ActivityLinkCard
    href={`/activity/reviews/${review.reviewId}`}
    identity={
      <ActivityIdentity
        name={review.breederNickname || '알 수 없는 브리더'}
        image={review.breederProfileImage}
        badge={<ReviewTypeBadge reviewType={review.reviewType} />}
      />
    }
    meta={`작성일 ${formatDate(review.writtenAt)}`}
    action="후기 자세히 보기"
  >
    <p className={TEXT.prose}>{review.content}</p>
  </ActivityLinkCard>
)
