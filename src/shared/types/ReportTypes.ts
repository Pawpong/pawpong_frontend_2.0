export interface ReportReviewPayload {
  reviewId: string
  reason: string
  description?: string
}

export interface ReportBreederPayload {
  breederId: string
  reason:
    | 'no_contract'
    | 'false_info'
    | 'inappropriate_content'
    | 'poor_conditions'
    | 'fraud'
    | 'other'
  description?: string
  evidence?: string[]
  contactInfo?: string
}
