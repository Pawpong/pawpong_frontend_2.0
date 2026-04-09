/**
 * 문의(Q&A) 관련 타입 정의
 * 출처: inquiries/_types/inquiry.ts
 *

 */

export type AnimalType = 'dog' | 'cat' | 'all';

export type InquiryType = 'common' | 'direct';

export type InquirySortType = 'latest_answer' | 'latest' | 'most_viewed';

export interface InquiryAnswer {
  id?: string;
  breederName: string;
  answeredAt: string;
  content: string;
  profileImageUrl?: string;
  imageUrls?: string[];
  helpfulCount?: number;
  animalTypeName?: string;
  breed?: string;
}

export interface Inquiry {
  id: string;
  title: string;
  content: string;
  type: InquiryType;
  animalType: AnimalType;
  viewCount: number;
  answerCount: number;
  latestAnswer?: InquiryAnswer;
  createdAt: string;
  authorNickname?: string;
  imageUrls?: string[];
  answers?: InquiryAnswer[];
  answerDeadline?: string;
  currentUserHasAnswered?: boolean;
}

export interface InquiryListResponse {
  data: Inquiry[];
  hasMore: boolean;
}

export interface CreateInquiryRequest {
  title: string;
  content: string;
  type: InquiryType;
  animalType: AnimalType;
  targetBreederId?: string;
  imageUrls?: string[];
}
