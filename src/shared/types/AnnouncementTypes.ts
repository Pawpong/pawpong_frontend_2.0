/** 공지(announcement) 관련 타입 정의 */

/** 공지 */
export interface Announcement {
  announcementId: string
  title: string
  content: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}
