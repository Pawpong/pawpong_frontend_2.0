import { useState } from 'react'
import type { ContestEntry } from '@/shared/types'
import { RANKING_PERIOD_CONFIG, type RankingPeriod } from './constants'

const useHallOfFame = () => {
  const [isRankingOpen, setIsRankingOpen] = useState(true)
  const [isVoteOpen, setIsVoteOpen] = useState(true)
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('current')
  const [selectedEntry, setSelectedEntry] = useState<ContestEntry | null>(null)

  const periodConfig = RANKING_PERIOD_CONFIG[rankingPeriod]

  const toggleRanking = () => setIsRankingOpen((prev) => !prev)
  const toggleVote = () => setIsVoteOpen((prev) => !prev)
  const switchPeriod = () => setRankingPeriod(periodConfig.next)
  const selectEntry = (entry: ContestEntry) => setSelectedEntry(entry)
  const closeModal = () => setSelectedEntry(null)

  return {
    isRankingOpen,
    isVoteOpen,
    periodConfig,
    selectedEntry,
    toggleRanking,
    toggleVote,
    switchPeriod,
    selectEntry,
    closeModal,
  }
}

export { useHallOfFame }
