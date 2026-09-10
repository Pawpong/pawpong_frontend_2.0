import { Badge } from './Badge'

// [refactored] 후기 타입 배지 — activity(내 후기/받은 후기/후기 상세)와 브리더 공개 홈이 함께 쓴다.
// 라우트별 _ui 에 흩어져 있던 라벨·variant 매핑을 여기 하나로 모은다.
const ReviewTypeBadge = ({ reviewType }: { reviewType: string }) => (
  <Badge variant={reviewType === 'adoption' ? 'primaryFilled' : 'pointFilled'} size="md">
    {reviewType === 'adoption' ? '입양 후기' : '상담 후기'}
  </Badge>
)

export { ReviewTypeBadge }
