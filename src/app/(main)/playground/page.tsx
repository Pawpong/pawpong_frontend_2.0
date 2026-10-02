import type { Metadata } from 'next'
import { PlaygroundBilling } from '@/features/in-app-purchase'

export const metadata: Metadata = {
  title: '놀이터',
  description: 'AI 사진 만들기와 놀이터 이용권을 한곳에서 확인하세요.',
}
export default function PlaygroundPage() {
  return <PlaygroundBilling />
}
