export interface Notice {
  noticeId: string
  title: string
  content: string
  authorName: string
  status: 'published' | 'draft' | 'archived'
  isPinned: boolean
  viewCount: number
  publishedAt?: string
  expiredAt?: string
  createdAt: string
  updatedAt: string
}
