export interface ReportReviewPayload {
  reviewId: string
  reason: string
  description?: string
}

export interface ReportBreederPayload {
  breederId: string
  reason: string
  description?: string
  evidence?: string[]
  contactInfo?: string
}
